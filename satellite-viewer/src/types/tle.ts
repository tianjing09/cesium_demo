/**
 * TLE 7参数模型
 * 6个轨道根数 + B*拖曳系数（大气阻力）
 */
export interface TLE7Params {
  // 历元时刻
  epoch: Date;
  // 6个轨道根数
  inclination: number; // 轨道倾角(°)
  raan: number; // 升交点赤经(°)
  eccentricity: number; // 偏心率
  argumentOfPerigee: number; // 近地点幅角(°)
  meanAnomaly: number; // 平近点角(°)
  meanMotion: number; // 平均运动(圈/天)
  // B*拖曳系数（低轨大气阻力核心参数）
  bStar: number;
}

/**
 * SGP4计算结果
 */
export interface SGP4Result {
  position: { x: number; y: number; z: number }; // 位置(km)
  velocity: { x: number; y: number; z: number }; // 速度(km/s)
}