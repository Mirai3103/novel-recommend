"use client"
import { useState, useEffect } from "react"
import { Search, Moon, Sun, Menu, X, User, BookOpen, Bell, Heart, Library, LogOut, Settings, ChevronDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator, DropdownMenuLabel } from "@/components/ui/dropdown-menu"
import Link from "next/link"
import { useAuth } from "@/contexts/auth-context"
import { logoutApiUsersLogoutPost } from "@/lib/client"
import { useTheme } from "./theme-provider"
import { usePathname } from "next/navigation"

export function Header() {
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const { theme, setTheme } = useTheme()
  // Mock logged in state
  const { isLoggedIn, user } = useAuth()
  console.log("Header", isLoggedIn, user)
  const [notificationCount, setNotificationCount] = useState(3)
  const pathname = usePathname()

  


  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20)
    }
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const navItems = [
    { label: "Trang chủ", href: "#" },
    { label: "Thể loại", href: "#categories" },
    { label: "Xếp hạng", href: "#trending" },
    { label: "Mới cập nhật", href: "#latest" },
  ]
 // if pathname is /novel/[id]/chapter/[chapterId], return null
 if (/^\/novel\/[^/]+\/chapter\/[^/]+$/.test(pathname)) {
  return null;
}

  return (
    <header
      className={`sticky top-0 z-50 w-full transition-all duration-300 ${
        isScrolled 
          ? "bg-background/95 backdrop-blur-xl border-b border-border/50 shadow-lg shadow-primary/5" 
          : "bg-gradient-to-b from-background/80 to-transparent backdrop-blur-sm"
      }`}
    >
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between gap-4">
          {/* Logo */}
          <a href="/" className="flex items-center gap-2 group">
            <div className="relative">
              <BookOpen className="h-8 w-8 text-primary transition-transform duration-300 group-hover:scale-110" />
              <div className="absolute inset-0 bg-primary/20 blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </div>
            <span className="text-2xl font-bold bg-gradient-to-r from-primary via-purple-500 to-pink-500 bg-clip-text text-transparent">
              NovelVerse
            </span>
          </a>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-1">
            {navItems.map((item) => (
              <a
                key={item.label}
                href={item.href}
                className="relative px-4 py-2 text-sm font-medium text-foreground/70 hover:text-foreground transition-colors group"
              >
                {item.label}
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-primary to-purple-500 group-hover:w-full transition-all duration-300" />
              </a>
            ))}
          </nav>

          {/* Search & Actions */}
          <div className="flex items-center gap-2">
            {/* Search Bar - Desktop */}
            <div className="hidden lg:flex items-center relative group">
              <Search className="absolute left-3 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
              <Input 
                type="search" 
                placeholder="Tìm kiếm light novel..." 
                className="pl-9 pr-4 w-64 bg-muted/50 border-border/50 focus:bg-muted focus:border-primary/50 transition-all duration-300"
              />
            </div>

            {/* Search Button - Mobile */}
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden rounded-full hover:bg-primary/10"
              onClick={() => setIsSearchOpen(!isSearchOpen)}
            >
              <Search className="h-5 w-5" />
            </Button>

            {/* Logged In User Actions */}
            {isLoggedIn ? (
              <>
                {/* Notifications */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="relative rounded-full hover:bg-primary/10">
                      <Bell className="h-5 w-5" />
                      {notificationCount > 0 && (
                        <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 bg-red-500 text-white text-xs border-2 border-background">
                          {notificationCount}
                        </Badge>
                      )}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-80">
                    <DropdownMenuLabel>Thông báo</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem className="flex flex-col items-start p-3 cursor-pointer">
                      <p className="font-medium text-sm">Chapter mới đã cập nhật!</p>
                      <p className="text-xs text-muted-foreground">Kỵ Sĩ Ma Pháp Vô Địch - Chapter 246</p>
                      <p className="text-xs text-muted-foreground mt-1">2 giờ trước</p>
                    </DropdownMenuItem>
                    <DropdownMenuItem className="flex flex-col items-start p-3 cursor-pointer">
                      <p className="font-medium text-sm">Novel yêu thích hoàn thành</p>
                      <p className="text-xs text-muted-foreground">Học Viện Pháp Thuật Tối Thượng</p>
                      <p className="text-xs text-muted-foreground mt-1">1 ngày trước</p>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem className="text-center text-sm text-primary cursor-pointer">
                      Xem tất cả
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>

                {/* Favorites/Library */}
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="hidden md:flex rounded-full hover:bg-primary/10"
                >
                  <Library className="h-5 w-5" />
                </Button>

                {/* User Menu */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="gap-2 pl-1 pr-3 rounded-full hover:bg-primary/10">
                      <div className="relative">
                        <img 
                          src={user?.avatar_url||"https://placewaifu.com/image/100/100"} 
                          alt={user?.username||"User"}
                          className="h-8 w-8 rounded-full object-cover ring-2 ring-primary/20"
                        />
                        <div className="absolute bottom-0 right-0 h-2.5 w-2.5 bg-green-500 rounded-full border-2 border-background" />
                      </div>
                      <span className="hidden md:inline text-sm font-medium">{user?.username||"User"}</span>
                      <ChevronDown className="h-4 w-4 opacity-50" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <DropdownMenuLabel>
                      <div className="flex flex-col">
                        <span className="font-semibold">{user?.username||"User"}</span>
                        <span className="text-xs text-muted-foreground">{user?.email||"User"}</span>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem className="cursor-pointer">
                      <User className="h-4 w-4 mr-2" />
                      Trang cá nhân
                    </DropdownMenuItem>
                    <DropdownMenuItem className="cursor-pointer">
                      <Library className="h-4 w-4 mr-2" />
                      Thư viện của tôi
                    </DropdownMenuItem>
                    <DropdownMenuItem className="cursor-pointer">
                      <Heart className="h-4 w-4 mr-2" />
                      Yêu thích
                    </DropdownMenuItem>
                    <DropdownMenuItem className="cursor-pointer">
                      <Settings className="h-4 w-4 mr-2" />
                      Cài đặt
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem 
                      className="cursor-pointer text-red-600 focus:text-red-600"
                      onClick={() => {
                        localStorage.removeItem("access_token")
                        logoutApiUsersLogoutPost().then(() => {
                          window.location.reload()
                        })
                      }}
                    >
                      <LogOut className="h-4 w-4 mr-2" />
                      Đăng xuất
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              /* Logged Out State */
              <>
                <Button
                asChild
                variant="ghost" size="sm" >
                  <Link href="/login"
                  >
                  Đăng nhập
                  </Link>
                </Button>
                <Button size="sm" className="bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90"
                asChild
                >
                  <Link href="/register"
                  >
                  Đăng ký
                  </Link>
                </Button>
              </>
            )}

            {/* Theme Toggle */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="rounded-full hover:bg-primary/10 hidden md:flex"
            >
              {theme === "dark" ? (
                <Sun className="h-5 w-5" />
              ) : (
                <Moon className="h-5 w-5" />
              )}
            </Button>

            {/* Mobile Menu Toggle */}
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden rounded-full hover:bg-primary/10"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile Search Bar */}
        {isSearchOpen && (
          <div className="lg:hidden py-3 border-t border-border/50 animate-in slide-in-from-top-2 duration-300">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input 
                type="search" 
                placeholder="Tìm kiếm..." 
                className="pl-9 w-full bg-muted/50"
                autoFocus
              />
            </div>
          </div>
        )}

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="lg:hidden py-4 border-t border-border/50 animate-in slide-in-from-top-2 duration-300">
            <nav className="flex flex-col gap-2">
              {navItems.map((item) => (
                <a
                  key={item.label}
                  href={item.href}
                  className="px-4 py-2 text-sm font-medium text-foreground/70 hover:text-foreground hover:bg-muted/50 rounded-lg transition-all"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {item.label}
                </a>
              ))}
              
              {isLoggedIn && (
                <>
                  <div className="h-px bg-border/50 my-2" />
                  <a href="#" className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-foreground/70 hover:text-foreground hover:bg-muted/50 rounded-lg transition-all">
                    <Library className="h-4 w-4" />
                    Thư viện của tôi
                  </a>
                  <a href="#" className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-foreground/70 hover:text-foreground hover:bg-muted/50 rounded-lg transition-all">
                    <Heart className="h-4 w-4" />
                    Yêu thích
                  </a>
                  <a href="#" className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-foreground/70 hover:text-foreground hover:bg-muted/50 rounded-lg transition-all">
                    <Settings className="h-4 w-4" />
                    Cài đặt
                  </a>
                </>
              )}
              
              <div className="h-px bg-border/50 my-2" />
              <button 
                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-foreground/70 hover:text-foreground hover:bg-muted/50 rounded-lg transition-all w-full text-left"
              >
                {theme === "dark" ? (
                  <>
                    <Sun className="h-4 w-4" />
                    Chế độ sáng
                  </>
                ) : (
                  <>
                    <Moon className="h-4 w-4" />
                    Chế độ tối
                  </>
                )}
              </button>
            </nav>
          </div>
        )}
      </div>
    </header>
  )
}
