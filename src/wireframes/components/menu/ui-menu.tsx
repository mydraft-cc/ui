import { connect } from 'react-redux'
import { bindActionCreators, Dispatch } from 'redux';
import { Button } from 'antd';
import * as React from 'react';

import './ui-menu.css';

import {
    setShowLeftSidebar,
    setShowRightSidebar,
    UIState,
    setZoom
} from '@app/wireframes/model';

interface UIMenuProps {
    // Show left sidebar.
    showLeftSidebar: boolean;

    // Show right sidebar.
    showRightSidebar: boolean;

    // Indicates if you can zoom in.
    canZoomIn: boolean;

    // Indicates if you can zoom out.
    canZoomOut: boolean;

    // The zoom level.
    zoom: number;

    // Sets the zoom.
    setZoom: (value: number) =>  any;

    // Show or hide the left sidebar.
    setShowLeftSidebar: (value: boolean) =>  any;

    // Show or hide the right sidebar.
    setShowRightSidebar: (value: boolean) =>  any;
}

const mapStateToProps = (state: { ui: UIState }) => {
    return {
        canZoomIn: state.ui.zoom < 2,
        canZoomOut: state.ui.zoom > .25,
        showLeftSidebar: state.ui.showLeftSidebar,
        showRightSidebar: state.ui.showRightSidebar,
        zoom: state.ui.zoom
    };
}

const mapDispatchToProps = (dispatch: Dispatch<any>) => bindActionCreators({
    setZoom, setShowLeftSidebar, setShowRightSidebar
}, dispatch);

const UIMenu = (props: UIMenuProps) => {
    return (
        <>
            <Button className='menu-item' size='large'
                disabled={!props.canZoomOut}
                onClick={() => props.setZoom(props.zoom - .25)}>
                <i className='icon-minus' />
            </Button>

            <span className='menu-item'>{props.zoom * 100}</span>

            <Button className='menu-item' size='large'
                disabled={!props.canZoomIn}
                onClick={() => props.setZoom(props.zoom + .25)}>
                <i className='icon-plus' />
            </Button>
        </>
    );
}

export const UIMenuContainer = connect(
    mapStateToProps,
    mapDispatchToProps
)(UIMenu);