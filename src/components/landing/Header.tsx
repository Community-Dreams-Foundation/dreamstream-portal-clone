
import { LucideRocket, ChevronDown } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuGroup,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"

interface HeaderProps {
  isLogin: boolean;
  setIsLogin: (isLogin: boolean) => void;
  handleSwitchToSignup: () => void;
  scrollToAuthForm: () => void;
}

export default function Header({ isLogin, setIsLogin, handleSwitchToSignup, scrollToAuthForm }: HeaderProps) {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-md supports-[backdrop-filter]:bg-background/60 border-b landing-header">
      <nav className="container flex items-center justify-between h-16 px-4 md:px-6">
        <div className="flex items-center gap-6">
          <a href="/" className="flex items-center gap-2 font-semibold">
            <LucideRocket className="h-5 w-5 text-primary" />
            <span className="text-lg font-bold landing-gradient-text">DreamStream</span>
          </a>
          <div className="hidden md:flex gap-6">
            <DropdownMenu>
              <DropdownMenuTrigger className="flex items-center gap-1 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                How It Works <ChevronDown className="h-4 w-4" />
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56">
                <DropdownMenuGroup>
                  <DropdownMenuItem>
                    <div className="flex flex-col">
                      <span className="font-medium">1. Get Onboard</span>
                      <span className="text-xs text-muted-foreground">Sign up quickly and complete registration</span>
                    </div>
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <div className="flex flex-col">
                      <span className="font-medium">2. Receive Documentation</span>
                      <span className="text-xs text-muted-foreground">Get offer letter and agreement</span>
                    </div>
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <div className="flex flex-col">
                      <span className="font-medium">3. Access Projects</span>
                      <span className="text-xs text-muted-foreground">Start with AI-driven support</span>
                    </div>
                  </DropdownMenuItem>
                </DropdownMenuGroup>
              </DropdownMenuContent>
            </DropdownMenu>

            <DropdownMenu>
              <DropdownMenuTrigger className="flex items-center gap-1 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                Features <ChevronDown className="h-4 w-4" />
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-64">
                <DropdownMenuGroup>
                  <DropdownMenuItem>
                    <div className="flex flex-col">
                      <span className="font-medium">Decentralized Task Execution</span>
                      <span className="text-xs text-muted-foreground">Transform ideas into micro-tasks</span>
                    </div>
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <div className="flex flex-col">
                      <span className="font-medium">AI-Driven Task Management</span>
                      <span className="text-xs text-muted-foreground">Get personalized guidance</span>
                    </div>
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <div className="flex flex-col">
                      <span className="font-medium">Real-Time Collaboration</span>
                      <span className="text-xs text-muted-foreground">Stay updated and connected</span>
                    </div>
                  </DropdownMenuItem>
                </DropdownMenuGroup>
              </DropdownMenuContent>
            </DropdownMenu>

            <DropdownMenu>
              <DropdownMenuTrigger className="flex items-center gap-1 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                Leadership <ChevronDown className="h-4 w-4" />
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-64">
                <DropdownMenuGroup>
                  <DropdownMenuItem>
                    <div className="flex flex-col">
                      <span className="font-medium">Development Program</span>
                      <span className="text-xs text-muted-foreground">Join our exclusive training</span>
                    </div>
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <div className="flex flex-col">
                      <span className="font-medium">Progressive Growth</span>
                      <span className="text-xs text-muted-foreground">Advance from emerging leader to Captain</span>
                    </div>
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <div className="flex flex-col">
                      <span className="font-medium">Competitive Advantage</span>
                      <span className="text-xs text-muted-foreground">Drive speed and innovation</span>
                    </div>
                  </DropdownMenuItem>
                </DropdownMenuGroup>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <Button
            variant={isLogin ? "ghost" : "outline"}
            onClick={() => {
              setIsLogin(true)
              scrollToAuthForm()
            }}
            className="font-medium"
          >
            Sign In
          </Button>
          <Button
            variant={!isLogin ? "default" : "outline"}
            onClick={handleSwitchToSignup}
            className="font-medium"
          >
            Join Now
          </Button>
        </div>
      </nav>
    </header>
  )
}
