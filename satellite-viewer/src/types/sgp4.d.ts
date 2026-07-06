declare module 'sgp4' {
  export interface SatRec {
    jdsatepoch: number;
    inclo: number;
    nodeo: number;
    ecco: number;
    argpo: number;
    mo: number;
    no: number;
    bstar: number;
    // 其他可能用到的属性
    [key: string]: any;
  }

  export interface Vector3 {
    x: number;
    y: number;
    z: number;
  }

  export interface PropagateResult {
    position: Vector3;
    velocity: Vector3;
  }

  export function twoline2satrec(line1: string, line2: string): SatRec;
  export function propagate(satrec: SatRec, minutesSinceEpoch: number): PropagateResult;
}