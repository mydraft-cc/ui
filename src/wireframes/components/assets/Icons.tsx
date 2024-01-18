/*
 * mydraft.cc
 *
 * @license
 * Copyright (c) Sebastian Stehle. All rights reserved.
*/

import { SearchOutlined } from '@ant-design/icons';
import { Input, Select } from 'antd';
import * as React from 'react';
import { useStore as useReduxStore } from 'react-redux';
import { Grid, useEventCallback } from '@app/core';
import { RootState, useAppDispatch } from '@app/store';
import { texts } from '@app/texts';
import { addShape, filterIcons, getDiagramId, getFilteredIcons, getIconSet, getIconSets, getIconsFilter, IconInfo, RendererService, selectIcons, useStore } from '@app/wireframes/model';
import { Icon } from './Icon';
import './Icons.scss';

const keyBuilder = (icon: IconInfo) => {
    return icon.name;
};

export const Icons = React.memo(() => {
    const dispatch = useAppDispatch();
    const iconSet = useStore(getIconSet);
    const iconSets = useStore(getIconSets);
    const iconsFilter = useStore(getIconsFilter);
    const iconsFiltered = useStore(getFilteredIcons);
    const store = useReduxStore<RootState>();

    const cellRenderer = React.useCallback((icon: IconInfo) => {
        const doAdd = () => {
            const selectedDiagramId = getDiagramId(store.getState() as any);

            if (selectedDiagramId) {
                const shapes = RendererService.createShapes([{ type: 'Icon', ...icon }]);

                for (const { size, appearance, renderer } of shapes) {
                    dispatch(addShape(selectedDiagramId, renderer, { position: { x: 100, y: 100 }, size, appearance }));
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
    }, [dispatch, store]);

    const doFilterIcons = useEventCallback((event: React.ChangeEvent<HTMLInputElement>) => {
        dispatch(filterIcons(event.target.value));
    });

    const doSelectIcons = useEventCallback((iconSet: string) => {
        dispatch(selectIcons(iconSet));
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
