import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { QueryProvider } from '@/providers/query-provider';

export const metadata: Metadata = {
	title: 'Dobbit',
	description: 'Dobbit web application',
};

export default function RootLayout({ children }: { children: ReactNode }) {
	return (
		<html lang='ko'>
			<body>
				<QueryProvider>{children}</QueryProvider>
			</body>
		</html>
	);
}
