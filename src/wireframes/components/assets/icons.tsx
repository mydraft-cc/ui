import * as React from 'react';
import { connect } from 'react-redux';
import { bindActionCreators, Dispatch } from 'redux';
import { Input } from 'antd';
import { AutoSizer, CellMeasurerCache, createMasonryCellPositioner, Masonry, MasonryCellProps } from 'react-virtualized';

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

const cache = new CellMeasurerCache({
    defaultHeight: 150,
    defaultWidth: 140,
    fixedWidth: true,
    fixedHeight: true
});

const cellPositioner = createMasonryCellPositioner({
    cellMeasurerCache: cache,
    columnCount: 2,
    columnWidth: 160,
    spacer: 0
});

const Icons = (props: IconsProps) => {
    const cellRenderer = (renderProps: MasonryCellProps) => {
        const icon = props.iconsFiltered[renderProps.index];

        if (!icon) {
            return null;
        }

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

            <div className='asset-icons-list'>
                <AutoSizer className='asset-icons-list'>
                    {({ height, width }) => (
                        <Masonry
                            autoHeight={false}
                            cellCount={props.iconsFiltered.length}
                            cellMeasurerCache={cache}
                            cellPositioner={cellPositioner}
                            cellRenderer={cellRenderer}
                            height={height}
                            width={width} />
                    )}
                </AutoSizer>
            </div>
        </>
    );
};

export const IconsContainer = connect(
    mapStateToProps,
    mapDispatchToProps
)(Icons);