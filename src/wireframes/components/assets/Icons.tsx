/*
 * mydraft.cc
 *
 * @license
 * Copyright (c) Sebastian Stehle. All rights reserved.
*/

import { SearchOutlined } from '@ant-design/icons';
import { Input, Select } from 'antd';
import * as React from 'react';
import { useDispatch, useStore as useReduxStore } from 'react-redux';
import { useRenderer } from '@app/context';
import { Grid, useEventCallback } from '@app/core';
import { texts } from '@app/texts';
import { addVisual, filterIcons, getDiagramId, getFilteredIcons, getIconSet, getIconSets, getIconsFilter, IconInfo, selectIcons, useStore } from '@app/wireframes/model';
import { Icon } from './Icon';
import './Icons.scss';

const keyBuilder = (icon: IconInfo) => {
    return icon.name;
};

export const Icons = React.memo(() => {
    const dispatch = useDispatch();
    const renderer = useRenderer();
    const iconSet = useStore(getIconSet);
    const iconSets = useStore(getIconSets);
    const iconsFilter = useStore(getIconsFilter);
    const iconsFiltered = useStore(getFilteredIcons);
    const store = useReduxStore();

    const cellRenderer = React.useCallback((icon: IconInfo) => {
        const doAdd = () => {
            const selectedDiagramId = getDiagramId(store.getState());

            if (selectedDiagramId) {
                const visuals = renderer.createVisuals([{ type: 'Icon', ...icon }]);

                for (const visual of visuals) {
                    dispatch(addVisual(selectedDiagramId, visual.id, 100, 100, visual.appearance, undefined, visual.width, visual.height));
                }
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
    }, [dispatch, renderer, store]);

    const doFilterIcons = useEventCallback((event: React.ChangeEvent<HTMLInputElement>) => {
        dispatch(filterIcons({ filter: event.target.value }));
    });

    const doSelectIcons = useEventCallback((iconSet: string) => {
        dispatch(selectIcons({ iconSet }));
    });

    return (
        <>
            <div className='asset-icons-search'>
                <Input value={iconsFilter} onChange={doFilterIcons}
                    placeholder={texts.common.findIcon}
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
        </>
    );
});
