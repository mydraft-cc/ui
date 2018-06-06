import { Button, Icon, Tooltip } from 'antd';
import * as React from 'react';
import { connect } from 'react-redux';
import { bindActionCreators, Dispatch } from 'redux';

import { Shortcut } from '@app/core';

import { setZoom, UIStateInStore } from '@app/wireframes/model';

interface UIMenuProps {
    // Indicates if you can zoom in.
    canZoomIn: boolean;

    // Indicates if you can zoom out.
    canZoomOut: boolean;

    // The zoom level.
    zoom: number;

    // Sets the zoom.
    setZoom: (value: number) => any;
}

const mapStateToProps = (state: UIStateInStore) => {
    return {
        canZoomIn: state.ui.zoom < 2,
        canZoomOut: state.ui.zoom > .25,
        zoom: state.ui.zoom
    };
};

const mapDispatchToProps = (dispatch: Dispatch<any>) => bindActionCreators({
    setZoom
}, dispatch);

const UIMenu = (props: UIMenuProps) => {
    const doZoomOut = () => {
        props.setZoom(props.zoom - .25);
    };

    const doZoomIn = () => {
        props.setZoom(props.zoom + .25);
    };

    return (
        <>
            <Tooltip mouseEnterDelay={1} title='Zoom Out (ALT + [-])'>
                <Button className='menu-item' size='large'
                    disabled={!props.canZoomOut}
                    onClick={doZoomOut}>
                    <Icon type='minus-circle-o' />
                </Button>
            </Tooltip>

            <Shortcut disabled={!props.canZoomOut} onPressed={doZoomOut} keys='alt+-' />

            <span className='menu-item'>{props.zoom * 100}</span>

            <Tooltip mouseEnterDelay={1} title='Zoom In (ALT + [+])'>
                <Button className='menu-item' size='large'
                    disabled={!props.canZoomIn}
                    onClick={doZoomIn}>
                    <Icon type='plus-circle-o' />
                </Button>
            </Tooltip>

            <Shortcut disabled={!props.canZoomIn} onPressed={doZoomIn} keys='alt+plus' />
        </>
    );
};

export const UIMenuContainer = connect(
    mapStateToProps,
    mapDispatchToProps
)(UIMenu);