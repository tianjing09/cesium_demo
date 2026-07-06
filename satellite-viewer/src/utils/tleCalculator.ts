import * as Cesium from 'cesium';
// import Cesium from "./cesium"
import { propagate, twoline2satrec } from 'sgp4';
// 修改这里：用 type 关键字导入类型
import type { TLE7Params, SGP4Result } from '../types/tle';

/**
 * 标准两行TLE解析为 7参数模型（自动提取B*）
 * @param line1 TLE第一行
 * @param line2 TLE第二行
 */
export function parseTLE7Params(line1: string, line2: string): TLE7Params {
  const satrec = twoline2satrec(line1, line2);
  return {
    epoch: new Date(satrec.jdsatepoch * 86400 * 1000), // 历元时刻
    inclination: satrec.inclo * (180 / Math.PI), // 倾角
    raan: satrec.nodeo * (180 / Math.PI), // 升交点赤经
    eccentricity: satrec.ecco, // 偏心率
    argumentOfPerigee: satrec.argpo * (180 / Math.PI), // 近地点幅角
    meanAnomaly: satrec.mo * (180 / Math.PI), // 平近点角
    meanMotion: satrec.no * 720 / Math.PI, // 平均运动(圈/天)
    bStar: satrec.bstar, // B*拖曳系数（核心阻力参数）
  };
}

/**
 * SGP4/SDP4 轨道计算（自动应用B*大气阻力修正）
 * @param line1 TLE行1
 * @param line2 TLE行2
 * @param date 计算时刻
 */
export function calculateOrbit(
  line1: string,
  line2: string,
  date: Date = new Date()
): SGP4Result {
  const satrec = twoline2satrec(line1, line2);
  
  // 儒略日时间
  const julianDate = date.getTime() / 86400000 + 2440587.5;
  const minutesSinceEpoch = (julianDate - satrec.jdsatepoch) * 1440;
  
  // SGP4核心计算：自动包含B*阻力、地球扁率、日月摄动
  const { position, velocity } = propagate(satrec, minutesSinceEpoch);
  
  return {
    position: {
      x: position.x,
      y: position.y,
      z: position.z,
    },
    velocity: {
      x: velocity.x,
      y: velocity.y,
      z: velocity.z,
    },
  };
}

/**
 * 坐标转换：SGP4(ECI) → Cesium(笛卡尔坐标系)
 */
export function eciToCesium(position: { x: number; y: number; z: number }) {
  const scale = 1000; // km → m
  return new Cesium.Cartesian3(
    position.x * scale,
    position.y * scale,
    position.z * scale
  );
}