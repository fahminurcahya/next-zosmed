import { getSession } from "@/server/auth";
import UserProfile from "./_components/user-profile";
import FlowEditor from "./workflow/_components/flow-editor";

const Page = async () => {
    const session = await getSession()

    return (
        <>

        </>
    );
}

export default Page;