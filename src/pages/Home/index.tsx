import type { TreeNode } from "@/hooks/use-tree"
import { Tree } from "@/components/ui/tree"

export const mixedTreeData: TreeNode[] = [
  {
    id: "dashboard",
    label: "Dashboard",
  },
  {
    id: "projects",
    label: "Projects",
    children: [
      {
        id: "project-a",
        label: "Project A",
        children: [
          { id: "project-a-overview", label: "Overview" },
          { id: "project-a-settings", label: "Settings" },
        ],
      },
      {
        id: "project-b",
        label: "Project B",
      },
    ],
  },
  {
    id: "settings",
    label: "Settings",
    children: [
      { id: "profile", label: "Profile" },
      { id: "security", label: "Security" },
    ],
  },
]

const Home = () => {
  return (
    <div>
      <Tree
        data={mixedTreeData}
      />
    </div>
  )
}

export default Home