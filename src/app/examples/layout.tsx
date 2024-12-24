import { Metadata } from "next"
import Link from "next/link"
import { Announcement } from "./components/announcement"
import { ExamplesNav } from "./components/examples-nav"
import {
	PageActions,
	PageHeader,
	PageHeaderDescription,
	PageHeaderHeading,
} from "./components/page-header"
import { Button } from "@/components/ui/button"
import { SiteFooter } from "./components/site-footer"
import { SiteHeader } from "./components/site-header"

export const metadata: Metadata = {
	title: "Examples",
	description: "Check out some examples app built using the components.",
}

export default function ExamplesLayout({
	children,
}: {
	children: React.ReactNode
}) {
	return (
		<div vaul-drawer-wrapper="">
			<div className="relative flex min-h-svh flex-col bg-background">
				<div data-wrapper="" className="border-grid flex flex-1 flex-col">
					<SiteHeader />
					<main className="flex flex-1 flex-col">
						<PageHeader>
							<Announcement />
							<PageHeaderHeading>Build your component library</PageHeaderHeading>
							<PageHeaderDescription>
								Beautifully designed components that you can copy and paste into your
								apps. Made with Tailwind CSS. Open source.
							</PageHeaderDescription>
							<PageActions>
								<Button asChild size="sm">
									<Link href="/docs">Get Started</Link>
								</Button>
									<Button asChild size="sm" variant="ghost">
									<Link href="/blocks">Browse Blocks</Link>
								</Button>
							</PageActions>
						</PageHeader>
						<div className="border-grid border-b">
							<div className="container-wrapper">
								<div className="container py-4">
									<ExamplesNav />
								</div>
							</div>
						</div>
						<div className="container-wrapper">
							<div className="container py-6">
								<section className="overflow-hidden rounded-[0.5rem] border bg-background shadow">
									{children}
								</section>
							</div>
						</div>
					</main>
					<SiteFooter />
				</div>
			</div>
		</div>
	)
}
