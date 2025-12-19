"use client"

import { useEffect, useState } from "react"
import { Calendar, Notebook, FolderCode, Plus, MoreVertical, Edit2, Trash2 } from "lucide-react"

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarInput,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuAction,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar"

import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { Tree } from "@/components/ui/tree"

import { cn } from "@/lib/utils"
import { Scope, TreeNode } from "@/lib/types"
import { treeApi } from "@/api"

const groups = [
  {
    title: "Notes",
    value: Scope.NOTES,
    icon: Notebook,
    isActive: true,
  },
  {
    title: "Snippets",
    value: Scope.SNIPPETS,
    icon: FolderCode,
    isActive: false,
  },
  {
    title: "Projects",
    value: Scope.PROJECTS,
    icon: Calendar,
    isActive: false,
  },
]

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {

  const [activeItem, setActiveItem] = useState(groups[0])
  const { open, setOpen } = useSidebar()

  const [treeData, setTreeData] = useState<TreeNode[]>([])

  const createTreeNode = async () => {
    const res = await treeApi.createTreeNode({
      scope: activeItem.value,
      parentId: null,
      name: "分组1",
    })
    fetchTreeData()

    console.log("🚀-fjf : res:", res);
  }

  const fetchTreeData = async () => {
    const data = await treeApi.getTree(activeItem.value)
    console.log("🚀-fjf : data:", data);
    setTreeData(data)
  }

  useEffect(() => {
    fetchTreeData()
  }, [activeItem])


  const renderActions = (node: TreeNode) => {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            onClick={(e) => {
              // Prevent row selection when opening the menu
              e.stopPropagation()
            }}
            aria-label="更多操作"
          >
            <MoreVertical />
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent side="bottom" align="start">
          <DropdownMenuItem
            onClick={() => {
              console.log("新增", node.id)
            }}
          >
            <Plus className="size-4" />
            新增
          </DropdownMenuItem>

          <DropdownMenuItem
            onClick={() => {
              console.log("编辑", node.id)
            }}
          >
            <Edit2 className="size-4" />
            编辑
          </DropdownMenuItem>

          <DropdownMenuSeparator />

          <DropdownMenuItem
            variant="destructive"
            onClick={() => {
              console.log("删除", node.id)
            }}
          >
            <Trash2 className="size-4" />
            删除
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    )
  }

  return (
    <Sidebar
      collapsible="icon"
      className="overflow-hidden *:data-[sidebar=sidebar]:flex-row"
      {...props}
    >
      {/* This is the first sidebar */}
      {/* We disable collapsible and adjust width to icon. */}
      {/* This will make the sidebar appear as icons. */}
      <Sidebar
        collapsible="none"
        className="w-[calc(var(--sidebar-width-icon)+1px)]! border-r"
      >
        <SidebarHeader>
          {
            open
              ?
              <Button
                variant="ghost"
                size="icon"
                className={cn("size-7")}
                onClick={() => setOpen(false)}
              >
                <Notebook color="red" />
              </Button>
              :
              <SidebarTrigger />
          }
        </SidebarHeader>
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupContent className="px-1.5 md:px-0">
              <SidebarMenu>
                {groups.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      tooltip={{
                        children: item.title,
                        hidden: false,
                      }}
                      onClick={() => {
                        setActiveItem(item)
                        setOpen(true)
                      }}
                      isActive={activeItem?.title === item.title}
                      className="px-2.5 md:px-2"
                    >
                      <item.icon />
                      <span>{item.title}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
        <SidebarFooter>
        </SidebarFooter>
      </Sidebar>

      {/* This is the second sidebar */}
      {/* We disable collapsible and let it fill remaining space */}
      <Sidebar collapsible="none" className="hidden flex-1 md:flex">
        <SidebarHeader className="gap-3.5 border-b p-4">
          <div className="flex w-full items-center justify-between">
            <div className="text-foreground text-base font-medium">
              {activeItem?.title}
            </div>
            <Button
              variant="outline"
              size="icon"
              className={cn("size-7")}
              onClick={() => createTreeNode()}
            >
              <Plus color="red" />
            </Button>
          </div>
          <SidebarInput placeholder="Type to search..." />
        </SidebarHeader>
        <SidebarContent>
          <SidebarGroup className="px-2">
            <SidebarGroupContent >
              <Tree
                data={treeData || []}
                renderActions={renderActions}
              />
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
      </Sidebar>
    </Sidebar>
  )
}
