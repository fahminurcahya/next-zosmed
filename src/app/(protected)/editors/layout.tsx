import ReduxProvider from "@/providers/redux-provider";

const Layout = ({ children }: { children: React.ReactNode }) => {
    return (
        <ReduxProvider>
            {children}
        </ReduxProvider>

    );
}

export default Layout;