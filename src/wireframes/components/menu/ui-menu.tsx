import * as React from 'react';
import { connect } from 'react-redux';
import { bindActionCreators, Dispatch } from 'redux';
import { Button, Icon } from 'antd';

import {
    UIState,
    setZoom
} from '@app/wireframes/model';

interface UIMenuProps {
    // Indicates if you can zoom in.
    canZoomIn: boolean;

    // Indicates if you can zoom out.
    canZoomOut: boolean;

    // The zoom level.
    zoom: number;

    // Sets the zoom.
    setZoom: (value: number) =>  any;
}

const mapStateToProps = (state: { ui: UIState }) => {
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
    return (
        <>
            <Button className='menu-item' size='large'
                disabled={!props.canZoomOut}
                onClick={() => props.setZoom(props.zoom - .25)}>
                <Icon type='minus-circle-o' />
            </Button>

            <span className='menu-item'>{props.zoom * 100}</span>

            <Button className='menu-item' size='large'
                disabled={!props.canZoomIn}
                onClick={() => props.setZoom(props.zoom + .25)}>
                <Icon type='plus-circle-o' />
            </Button>
        </>
    );
};

export const UIMenuContainer = connect(
    mapStateToProps,
    mapDispatchToProps
)(UIMenu);