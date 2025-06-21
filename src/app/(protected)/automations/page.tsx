import CreateAutomationDialog from "./_components/create-automation-dialog";
import ListAutomation from "./_components/list-automation";




const Page = () => {
    return (
        <div className="flex-1 flex flex-col h-full">
            <div className="flex justify-between">
                <div className="flex flex-col">
                    <h1 className="text-3xl font-bold">Automations</h1>
                    <p className="text-muted-foreground">Manage your automation</p>
                </div>
                <CreateAutomationDialog />
            </div>

            <div className="h-full py-6">
                <ListAutomation />
            </div>
        </div>
    );
}


export default Page;