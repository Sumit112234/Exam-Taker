import { AdminNav } from "@/components/admin-nav"
import { UserNav } from "@/components/user-nav"
import { AdminBreadcrumb } from "@/components/admin-breadcrumb"

export default function AdminLayout({ children }) {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-10 border-b bg-background">
        <div className="container flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold">ExamPro Admin</h1>
          </div>
          <UserNav />
        </div>
      </header>
      <div className="container px-4 flex-1 items-start md:grid md:grid-cols-[220px_1fr] md:gap-6 lg:grid-cols-[240px_1fr] lg:gap-10">
        <aside className="fixed top-16 z-30 -ml-2 hidden h-[calc(100vh-4rem)] w-full shrink-0 overflow-y-auto border-r md:sticky md:block">
          <AdminNav />
        </aside>
        <main className="flex w-full flex-col overflow-hidden py-6">
          <AdminBreadcrumb />
          {children}
        </main>
      </div>
    </div>
  )
}
