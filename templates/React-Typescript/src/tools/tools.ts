import { UserAccessLevelEnum } from '~/core/types/apiModels/Session';

class Tools {
    // public --> start region /////////////////////////////////////////////
    public static userLevelTranslater(l: UserAccessLevelEnum): string {
        switch (l) {
            case UserAccessLevelEnum.ADMIN:
                return 'Administrateur';
            case UserAccessLevelEnum.LEADER:
                return "Chef d'équipe";
            case UserAccessLevelEnum.SECRETARIAT:
                return 'Secrétariat';
            case UserAccessLevelEnum.TEAMMATE:
                return 'Collaborateur';
            default:
                return 'n/a';
        }
    }
    // public --> end region ///////////////////////////////////////////////

    // private --> start region ////////////////////////////////////////////
    // private --> end region //////////////////////////////////////////////
}
export default Tools;
