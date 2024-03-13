import { NavigateFunction } from "react-router-dom";
import { OnboardingStatusType } from "../types/onboardingStatus";
import { UserRole, UserType } from "../types/user";

export function onboarding(nav: NavigateFunction, user: UserType, userOnboardingStatus: OnboardingStatusType, pathname: string) {
    // const nav = useNavigate();
    // returns path to navigate to. returns empty string if no navigation required.
    // console.log(userOnboardingStatus);
    switch(userOnboardingStatus.status) {
        case "new_user":
            navigate("/selectRole");
            return;
        case "onboarded":
            navigate("/");
            return;
        case "selected_role":
            if(user.role?.valueOf === UserRole.Tenant.valueOf){
                navigate("/tenantSetup");
            } else if(user.role?.valueOf == UserRole.Landlord.valueOf) {
                navigate("/landlordSetup");
            } else {
                navigate("agentSetup");
            }
            return;
        case "tenant_setup":
            navigate("/tenantSetup");
    }

    function navigate(toPath: string) {
        if(pathname != toPath) {
            nav(toPath);
        }
    }
}