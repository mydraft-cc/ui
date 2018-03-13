import * as React from 'react';
import { connect } from 'react-redux';
import { bindActionCreators, Dispatch } from 'redux';
import { Input } from 'antd';

import './icons.scss';

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
    return (
        <>
            <div className='asset-icons-search'>
                <Input placeholder='Find icon' value={props.iconsFilter} onChange={event => props.filterIcons(event.target.value)} />
            </div>

            <div className='asset-icons-list'>
                {props.iconsFiltered.map(s =>
                    <div key={s.name} className='asset-icon'>
                        <div className='asset-icon-preview'>
                            <Icon icon={s} />
                        </div>

                        <div className='asset-icon-title'>{s.label}</div>
                    </div>
                )}
            </div>
        </>
    );
};

export const IconsContainer = connect(
    mapStateToProps,
    mapDispatchToProps
)(Icons);