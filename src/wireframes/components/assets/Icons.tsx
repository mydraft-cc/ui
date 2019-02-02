import { Icon as AntdIcon, Input, Select } from 'antd';
import * as React from 'react';
import { connect } from 'react-redux';
import { bindActionCreators, Dispatch } from 'redux';

import './Icons.scss';

import { Grid } from '@app/core';

import {
    addIcon,
    AssetsStateInStore,
    EditorStateInStore,
    filterIcons,
    getDiagramId,
    getFilteredIcons,
    getIconSet,
    getIconSets,
    getIconsFilter,
    IconInfo,
    selectIcons
} from '@app/wireframes/model';

import { Icon } from './Icon';

interface IconsProps {
    // The filtered icons.
    iconsFiltered: IconInfo[];

    // The icons filter.
    iconsFilter: string;

    // The current icon set.
    iconSet: string;

    // All icon sets.
    iconSets: string[];

    // The selected diagram.
    selectedDiagramId: string | null;

    // Filter the icons.
    filterIcons: (value: string) => any;

    // Select an icon set.
    selectIcons: (iconSet: string) => any;

    // Adds an Icon.
    addIconToPosition: (diagram: string, text: string, fontFamily: string) => any;
}

const addIconToPosition = (diagram: string, text: string, fontFamily: string) => {
    return addIcon(diagram, text, fontFamily, 100, 100);
};

const mapStateToProps = (state: AssetsStateInStore & EditorStateInStore) => {
    return {
        selectedDiagramId: getDiagramId(state),
        iconsFiltered: getFilteredIcons(state),
        iconsFilter: getIconsFilter(state),
        iconSets: getIconSets(state),
        iconSet: getIconSet(state)
    };
};

const mapDispatchToProps = (dispatch: Dispatch) => bindActionCreators({
    filterIcons, addIconToPosition, selectIcons
}, dispatch);

class Icons extends React.PureComponent<IconsProps> {
    private cellRenderer = (icon: IconInfo) => {
        const doAdd = () => {
            const diagramId = this.props.selectedDiagramId;

            if (diagramId) {
                this.props.addIconToPosition(diagramId, icon.text, icon.fontFamily);
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
    }

    private doSelectIcons = (iconSet: string) => {
        this.props.selectIcons(iconSet);
    }

    private doFilterIcons = (event: React.ChangeEvent<HTMLInputElement>) => {
        this.props.filterIcons(event.target.value);
    }

    private keyBuilder = (icon: IconInfo) => {
        return icon.name;
    }

    public render() {
        return (
            <>
                <div className='asset-icons-search'>
                    <Input value={this.props.iconsFilter} onChange={this.doFilterIcons}
                        placeholder='Find icon'
                        prefix={<AntdIcon type='search' style={{ color: 'rgba(0,0,0,.25)' }} />} />

                    <Select value={this.props.iconSet} onChange={this.doSelectIcons}>
                        {this.props.iconSets.map(x =>
                            <Select.Option key={x} value={x}>{x}</Select.Option>
                        )}
                    </Select>
                </div>

                <Grid className='asset-icons-list' renderer={this.cellRenderer} columns={3} items={this.props.iconsFiltered} keyBuilder={this.keyBuilder} />
            </>
        );
    }
}

export const IconsContainer = connect(
    mapStateToProps,
    mapDispatchToProps
)(Icons);