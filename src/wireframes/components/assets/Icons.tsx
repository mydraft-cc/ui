import { Icon as AntdIcon, Input, Select } from 'antd';
import * as React from 'react';
import { ReactReduxContext, useDispatch } from 'react-redux';

import './Icons.scss';

import { Grid } from '@app/core';

import {
    addIcon,
    filterIcons,
    getDiagramId,
    getFilteredIcons,
    getIconSet,
    getIconSets,
    getIconsFilter,
    IconInfo,
    selectIcons,
    useStore
} from '@app/wireframes/model';

import { Icon } from './Icon';

const keyBuilder = (icon: IconInfo) => {
    return icon.name;
};

export const Icons = React.memo(() => {
    const dispatch = useDispatch();
    const iconsFiltered = useStore(s => getFilteredIcons(s));
    const iconsFilter = useStore(s => getIconsFilter(s));
    const iconSets = useStore(s => getIconSets(s));
    const iconSet = useStore(s => getIconSet(s));

    const storeContext = React.useContext(ReactReduxContext);

    const cellRenderer = React.useCallback((icon: IconInfo) => {
        const doAdd = () => {
            const selectedDiagramId = getDiagramId(storeContext.store.getState());

            if (selectedDiagramId) {
                dispatch(addIcon(selectedDiagramId, icon.text, icon.fontFamily, 100, 100));
            }
        };

        return (
            <div className='asset-icon'>
                <div className='asset-icon-preview' onDoubleClick={doAdd}>
                    <Icon icon={icon} />
                </div>

                <div className='asset-icon-title'>{icon.displayName}</div>
            </div>
        );
    }, []);

    const doFilterIcons = React.useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
        dispatch(filterIcons(event.target.value));
    }, []);

    const doSelectIcons = React.useCallback((set: string) => {
        dispatch(selectIcons(set));
    }, []);

    return (
        <>
            <div className='asset-icons-search'>
                <Input value={iconsFilter} onChange={doFilterIcons} placeholder='Find icon'
                    prefix={
                        <AntdIcon type='search' style={{ color: 'rgba(0,0,0,.25)' }} />
                    }
                />

                <Select value={iconSet} onChange={doSelectIcons}>
                    {iconSets.map(x =>
                        <Select.Option key={x} value={x}>{x}</Select.Option>
                    )}
                </Select>
            </div>

            <Grid className='asset-icons-list' renderer={cellRenderer} columns={3} items={iconsFiltered} keyBuilder={keyBuilder} />
        </>
    );
});