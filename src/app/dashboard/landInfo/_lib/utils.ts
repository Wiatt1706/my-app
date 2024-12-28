import { type LandInfo } from "@/db/schema"
import {

  CheckCircle2,
  CircleHelp,
  CircleIcon,
  CircleX,
  Timer,
} from "lucide-react"

/**
 * Returns the appropriate status icon based on the provided status.
 * @param status - The status of the task.
 * @returns A React component representing the status icon.
 */
export function getTypeContent(type: LandInfo["landType"]) {
  const typesIcons = {
    0: CircleX,
    1: CheckCircle2,
    2: Timer,
    3: CircleHelp,
  }
  const LAND_TYPE = [
    { key: "0", label: "像素块" },
    { key: "1", label: "地图块" },
    { key: "2", label: "展示块" },
    { key: "3", label: "游戏" },
  ];
  return {
    icon: typesIcons[type] || CircleIcon,
    text: LAND_TYPE[type].label,
  }
}
/**
 * Returns the appropriate status icon based on the provided status.
 * @param status - The status of the task.
 * @returns A React component representing the status icon.
 */
