import type { LessonVideoScript } from "../../types";
import { M_AREA_VOLUME } from "./areaVolume";
import { M_CIRCLES } from "./circles";
import { M_EQUIV_EXPR } from "./equivExpr";
import { M_INFERENCE } from "./inference";
import { M_LINEAR_EQ_1VAR } from "./linearEq1var";
import { M_LINEAR_EQ_2VAR } from "./linearEq2var";
import { M_LINEAR_FUNC } from "./linearFunc";
import { M_LINEAR_INEQ } from "./linearIneq";
import { M_LINES_ANGLES_TRI } from "./linesAnglesTri";
import { M_NONLINEAR_EQ } from "./nonlinearEq";
import { M_NONLINEAR_FUNC } from "./nonlinearFunc";
import { M_ONE_VAR_DATA } from "./oneVarData";
import { M_PERCENTAGES } from "./percentages";
import { M_PROBABILITY } from "./probability";
import { M_RATIOS_RATES } from "./ratiosRates";
import { M_RIGHT_TRI_TRIG } from "./rightTriTrig";
import { M_STATISTICAL_CLAIMS } from "./statisticalClaims";
import { M_SYSTEMS } from "./systems";
import { M_TWO_VAR_DATA } from "./twoVarData";

// Math lesson video scripts, one file per skill.
export const MATH: LessonVideoScript[] = [
  ...M_LINEAR_EQ_1VAR,
  ...M_LINES_ANGLES_TRI,
  ...M_LINEAR_FUNC,
  ...M_LINEAR_EQ_2VAR,
  ...M_SYSTEMS,
  ...M_LINEAR_INEQ,
  ...M_EQUIV_EXPR,
  ...M_NONLINEAR_EQ,
  ...M_NONLINEAR_FUNC,
  ...M_RATIOS_RATES,
  ...M_PERCENTAGES,
  ...M_ONE_VAR_DATA,
  ...M_TWO_VAR_DATA,
  ...M_PROBABILITY,
  ...M_INFERENCE,
  ...M_STATISTICAL_CLAIMS,
  ...M_AREA_VOLUME,
  ...M_RIGHT_TRI_TRIG,
  ...M_CIRCLES,
];
