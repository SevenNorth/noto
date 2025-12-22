"use client"

import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
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
import NodeDialog from "@/widgets/NodeDialog"

import { cn } from "@/lib/utils"
import { NodeType, Scope, TreeNode } from "@/lib/types"
import { findNodeById } from "@/lib/tree"
import { notesApi, treeApi } from "@/api"
import { useConfirm } from "@/hooks/use-comfirm"

const groups = [
  {
    title: "Notes",
    value: Scope.NOTES,
    label: "笔记",
    icon: Notebook,
    isActive: true,
  },
  {
    title: "Snippets",
    value: Scope.SNIPPETS,
    label: "代码片段",
    icon: FolderCode,
    isActive: false,
  },
  {
    title: "Projects",
    value: Scope.PROJECTS,
    label: "项目",
    icon: Calendar,
    isActive: false,
  },
]

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {

  const [activeItem, setActiveItem] = useState(groups[0])
  const { open, setOpen } = useSidebar()
  const navigate = useNavigate()

  const [treeData, setTreeData] = useState<TreeNode[]>([])

  const [dialogOpen, setDialogOpen] = useState(false)

  const [isEdit, setIsEdit] = useState(false)
  const [curNode, setCurNode] = useState<TreeNode | null>(null)
  const [createLeaf, setCreateLeaf] = useState(false)

  const handleSelect = (id?: string) => {
    if (!id) return
    const node = findNodeById(treeData, id)
    if (!node) return
    if (node.nodeType === NodeType.NOTE && node.resourceId) {
      navigate(`/notes/${node.resourceId}`)
      return
    }
    if (node.nodeType === NodeType.SNIPPET && node.resourceId) {
      navigate(`/snippets/${node.resourceId}`)
      return
    }
    if (node.nodeType === NodeType.PROJECT) {
      navigate(`/projects/${node.id}`)
      return
    }
  }

  const fetchTreeData = async () => {
    const data = await treeApi.getTree(activeItem.value)
    setTreeData(data)
  }

  useEffect(() => {
    fetchTreeData()
  }, [activeItem])

  const handleSubmit = async (values: { name: string }, node?: TreeNode | null) => {
    if (isEdit) {
      await treeApi.updateTreeNode({
        nodeId: node.id,
        name: values.name,
      })
    } else {
      await treeApi.createTreeNode({
        name: values.name,
        nodeType: NodeType.FOLDER,
        scope: activeItem.value,
        parentId: node ? node.id : null,
      })
    }
    fetchTreeData()
  }

  const confirm = useConfirm()
  const handleDelete = async (node: TreeNode) => {
    const result = await confirm({
      title: "确认删除？",
      description: `删除后该节点下的所有子节点都会被删除，且无法恢复。`,
      confirmText: "删除",
      cancelText: "取消",
      onConfirm: async () => {
        await treeApi.deleteTreeNode(node.id)
      },
    })

    if (result) {
      fetchTreeData()
    }
  }

  const handleCreateLeaf = async (values: { name: string }, node?: TreeNode | null) => {
    await notesApi.createNote({
      title: values.name,
      parentId: node?.id,
    })
    fetchTreeData()
  }

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
              setCurNode(node)
              setIsEdit(false)
              setCreateLeaf(false)
              setDialogOpen(true)
            }}
          >
            <Plus className="size-4" />
            新增目录
          </DropdownMenuItem>

          <DropdownMenuItem
            onClick={() => {
              setCurNode(node)
              setIsEdit(true)
              setCreateLeaf(false)
              setDialogOpen(true)
            }}
          >
            <Edit2 className="size-4" />
            编辑目录
          </DropdownMenuItem>

          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={() => {
              setCurNode(node)
              setIsEdit(false)
              setCreateLeaf(true)
              setDialogOpen(true)
            }}
          >
            <Plus className="size-4" />
            新增{activeItem.label}
          </DropdownMenuItem>

          <DropdownMenuSeparator />

          <DropdownMenuItem
            variant="destructive"
            onClick={() => {
              handleDelete(node)
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
              onClick={() => {
                setCurNode(null)
                setDialogOpen(true)
              }}
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
                onSelectedChange={handleSelect}
                renderActions={renderActions}
              />
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
      </Sidebar>
      <NodeDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        node={curNode}
        isEdit={isEdit}
        onSubmit={createLeaf ? handleCreateLeaf : handleSubmit}
      />
    </Sidebar>
  )
}
