import { cookies } from "next/headers"

import { accounts, mails } from "./data";
import { Mail } from "./components/mail";

export default async function MailPage() {
	const cookieStore = await cookies();
	const layout = cookieStore.get('react-resizable-panels:layout:mail')
	const collapsed = cookieStore.get('react-resizable-panels:collapsed')

	const defaultLayout = layout ? JSON.parse(layout.value) : undefined
	const defaultCollapsed = collapsed ? JSON.parse(collapsed.value) : undefined

	return (
		<Mail
			accounts={accounts}
			mails={mails}
			defaultLayout={defaultLayout}
			defaultCollapsed={defaultCollapsed}
			navCollapsedSize={4}
			/>
	)
}
