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
export function getStatusIcon(type: LandInfo["landType"]) {
  const statusIcons = {
    0: CircleX,
    1: CheckCircle2,
    2: Timer,
    3: CircleHelp,
  }

  return statusIcons[type] || CircleIcon
}
