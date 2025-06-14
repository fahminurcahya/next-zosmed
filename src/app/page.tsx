import { getSession } from "@/server/auth";
import UserProfile from "./_components/user-profile";

const Page = async () => {
    const session = await getSession()

    return (
        <>
            {session?.user ? (
                <UserProfile user={session.user} />)
                : (
                    <a href="/sign-in">
                        <button
                            type="submit"
                            className="rounded-full bg-white/10 px-10 py-3 font-semibold transition hover:bg-white/20"
                        >
                            Login
                        </button>
                    </a>
                )}
        </>
    );
}

export default Page;