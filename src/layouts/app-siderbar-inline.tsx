import { Calendar, Notebook, FolderCode } from "lucide-react"

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarTrigger,
  useSidebar
} from "@/components/ui/sidebar"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { useNavigate } from "react-router"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"

export function AppSidebarInline() {
  const { open } = useSidebar()

  const navigate = useNavigate();
  const handelNavTo = (item) => {
    navigate(item.url);
  }

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="flex flex-row items-center justify-between">
        {open && <Button
          variant="ghost"
          size="icon"
          className={cn("size-7")}
        >
          <Notebook />
        </Button>}
        <SidebarTrigger />
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              <Collapsible
                asChild
                className="group/collapsible"
              >
                <SidebarMenuItem>
                  <CollapsibleTrigger >
                    <SidebarMenuButton>
                      <Notebook />
                      <span>Notes</span>
                    </SidebarMenuButton>
                  </CollapsibleTrigger>
                  <CollapsibleContent >
                    Notes
                  </CollapsibleContent>
                </SidebarMenuItem>
              </Collapsible>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              <Collapsible
                asChild
                className="group/collapsible"
              >
                <SidebarMenuItem>
                  <CollapsibleTrigger >
                    <SidebarMenuButton>
                      <FolderCode />
                      <span>Snippets</span>
                    </SidebarMenuButton>
                  </CollapsibleTrigger>
                  <CollapsibleContent >
                    Snippets
                  </CollapsibleContent>
                </SidebarMenuItem>
              </Collapsible>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              <Collapsible
                asChild
                className="group/collapsible"
              >
                <SidebarMenuItem>
                  <CollapsibleTrigger >
                    <SidebarMenuButton>
                      <Calendar />
                      <span>Projects</span>
                    </SidebarMenuButton>
                  </CollapsibleTrigger>
                  <CollapsibleContent >
                    Projects
                  </CollapsibleContent>
                </SidebarMenuItem>
              </Collapsible>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  )
}