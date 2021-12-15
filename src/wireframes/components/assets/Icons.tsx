/*
 * mydraft.cc
 *
 * @license
 * Copyright (c) Sebastian Stehle. All rights reserved.
*/

import { SearchOutlined } from '@ant-design/icons';
import { Grid } from '@app/core';
import { addIcon, filterIcons, getDiagramId, getFilteredIcons, getIconSet, getIconSets, getIconsFilter, IconInfo, selectIcons, useStore } from '@app/wireframes/model';
import { Input, Select } from 'antd';
import * as React from 'react';
import { ReactReduxContext, useDispatch } from 'react-redux';
import { Icon } from './Icon';

import './Icons.scss';

const keyBuilder = (icon: IconInfo) => {
    return icon.name;
};

export const Icons = React.memo(() => {
    const dispatch = useDispatch();
    const iconsFiltered = useStore(getFilteredIcons);
    const iconsFilter = useStore(getIconsFilter);
    const iconSets = useStore(getIconSets);
    const iconSet = useStore(getIconSet);

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
    }, [dispatch, storeContext.store]);

    const doFilterIcons = React.useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
        dispatch(filterIcons({ filter: event.target.value }));
    }, [dispatch]);

    const doSelectIcons = React.useCallback((iconSet: string) => {
        dispatch(selectIcons({ iconSet }));
    }, [dispatch]);

    return <>
        <div className='asset-icons-search'>
            <Input value={iconsFilter} onChange={doFilterIcons} placeholder='Find icon'
                prefix={
                    <SearchOutlined style={{ color: 'rgba(0,0,0,.25)' }} />
                }
            />

            <Select value={iconSet} onChange={doSelectIcons}>
                {iconSets.map(x =>
                    <Select.Option key={x} value={x}>{x}</Select.Option>,
                )}
            </Select>
        </div>

        <Grid className='asset-icons-list' renderer={cellRenderer} columns={4} items={iconsFiltered} keyBuilder={keyBuilder} />
    </>;
});
