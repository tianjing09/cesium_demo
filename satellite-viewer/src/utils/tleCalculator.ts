// utils/tleCalculator.ts
// import { propagate, twoline2rv } from 'sgp4';
import * as satellite from "satellite.js";
import type { TLE7Params, SGP4Result } from '../types/tle';
import Cesium from '../cesium';

/**
 * 标准两行TLE解析为 7参数模型（自动提取B*）
 * @param line1 TLE第一行
 * @param line2 TLE第二行
 */
export function parseTLE7Params(line1: string, line2: string): TLE7Params {
  const satrec = satellite.twoline2satrec(line1, line2);
  
  return {
    epoch: new Date((satrec.jdsatepoch  - 2440587.5) * 86400 * 1000), // 历元时刻
    inclination: satrec.inclo * (180 / Math.PI), // 倾角
    raan: satrec.nodeo * (180 / Math.PI), // 升交点赤经
    eccentricity: satrec.ecco, // 偏心率
    argumentOfPerigee: satrec.argpo * (180 / Math.PI), // 近地点幅角
    meanAnomaly: satrec.mo * (180 / Math.PI), // 平近点角
    meanMotion: satrec.no * 720 / Math.PI, // 平均运动(圈/天)
    bStar: satrec.bstar, // B*拖曳系数（核心阻力参数）
    satnum: satrec.satnum,
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
  // 1. TLE → satrec（只做一次更好，但这里保留函数也OK）
  const satrec = satellite.twoline2satrec(line1, line2);

  // 2. 直接 propagate（核心修复）
  const pv = satellite.propagate(satrec, date);

  const position = pv?.position ?? { x: 0, y: 0, z: 0 };
  const velocity = pv?.velocity ?? { x: 0, y: 0, z: 0 };


  // 3. 返回标准化结构
  return {
    position: {
      x: position.x ,
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