import { Input } from 'antd';
import * as React from 'react';
import { connect } from 'react-redux';
import { bindActionCreators, Dispatch } from 'redux';

import './icons.scss';

import { Grid } from '@app/core';

import {
    AssetsState,
    filterIcons,
    IconInfo
} from '@app/wireframes/model';

import { Icon } from './icon';

interface IconsProps {
    // The filtered icons.
    iconsFiltered: IconInfo[];

    // The icons filter.
    iconsFilter: string;

    // Filter the icons.
    filterIcons: (value: string) => any;
}

const mapStateToProps = (state: { assets: AssetsState }) => {
    return {
        iconsFiltered: state.assets.iconsFiltered,
        iconsFilter: state.assets.iconsFilter
    };
};

const mapDispatchToProps = (dispatch: Dispatch<any>) => bindActionCreators({
    filterIcons
}, dispatch);

const Icons = (props: IconsProps) => {
    const cellRenderer = (icon: IconInfo) => {
        return (
            <div className='asset-icon'>
                <div className='asset-icon-preview'>
                    <Icon icon={icon} />
                </div>

                <div className='asset-icon-title'>{icon.label}</div>
            </div>
        );
    };

    return (
        <>
            <div className='asset-icons-search'>
                <Input placeholder='Find icon' value={props.iconsFilter} onChange={event => props.filterIcons(event.target.value)} />
            </div>

            <Grid className='asset-icons-list' renderer={cellRenderer} columns={2} items={props.iconsFiltered} keyBuilder={icon => icon.name} />
        </>
    );
};

export const IconsContainer = connect(
    mapStateToProps,
    mapDispatchToProps
)(Icons);