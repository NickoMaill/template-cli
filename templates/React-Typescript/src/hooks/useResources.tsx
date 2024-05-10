import { useContext } from 'react';
import { useTranslation } from 'react-i18next';
import SearchContext, { SearchField } from '~/context/searchContext';
import { RecursiveKeyOf } from '~/core/types/custom';
import { TranslationResourcesType } from '~/core/types/i18nTypes';

export default function useResources(): IUseResources {
    const { t } = useTranslation();
    const Search = useContext(SearchContext);

    const translate = (key: RecursiveKeyOf<TranslationResourcesType>, args?: any): string => {
        return t(key, args).toString();
    };

    // const importComponent = async <T,>(path: string, props?: T) => {
    //     try {
    //         const module = await import(path);
    //         const DynamicComponent = module.default || module;
    //         return <DynamicComponent {...props} />;
    //     } catch (error) {
    //         throw new AppError(ErrorTypeEnum.Functional, 'error while loading main component, error :' + error, 'loading_error');
    //     }
    // };

    const setSearchContent = (field: string, fieldName: string, value: string) => {
        let index = -1;
        if (Search.filters && Search.filters.length > 0) {
            index = Search.filters.findIndex((f) => f.field === field);
        }

        if (index < 0) {
            const filterToAppend: SearchField = {
                field,
                fieldName,
                values: value,
            };
            Search.setFilters([filterToAppend]);
        } else if (value === '' || !value) {
            setTimeout(() => {
                Search.setFilters((prevState) => {
                    return prevState.filter((p) => p.field !== field);
                });
            }, 700);
        } else {
            setTimeout(() => {
                Search.setFilters((prevState) => {
                    return prevState.map((obj, i) => {
                        if (i === index) {
                            return { ...obj, ['values']: value };
                        } else {
                            return obj;
                        }
                    });
                });
            }, 700);
        }
    };

    return { translate, setSearchContent };
}

interface IUseResources {
    translate: (key: RecursiveKeyOf<TranslationResourcesType>, args?: any) => string;
    setSearchContent: (field: string, fieldName: string, value: string) => void;
    // importComponent: <T>(path: string, props: T) => Promise<JSX.Element>;
}
