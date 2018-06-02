import { Button, Collapse, Layout, Tabs } from 'antd';
import * as React from 'react';
import { DragDropContextProvider } from 'react-dnd';
import HTML5Backend from 'react-dnd-html5-backend';
import { connect } from 'react-redux';
import { bindActionCreators, Dispatch } from 'redux';

import {
    ArrangeMenuContainer,
    CustomPropertiesContainer,
    EditorViewContainer,
    HistoryMenuContainer,
    IconsContainer,
    LayoutPropertiesContainer,
    ShapesContainer,
    UIMenuContainer,
    VisualPropertiesContainer
} from '@app/wireframes/components';

import {
    RendererService,
    selectTab,
    toggleLeftSidebar,
    toggleRightSidebar,
    UIState
} from '@app/wireframes/model';

interface AppOwnProps {
    // The renderer service.
    rendererService: RendererService;
}

interface AppProps {
    // The renderer service.
    rendererService: RendererService;

    // Show left sidebar.
    showLeftSidebar: boolean;

    // Show right sidebar.
    showRightSidebar: boolean;

    // The selected tabs
    selectedTab: string;

    // Select a tab.
    selectTab: (key: string) => any;

    // Show or hide the left sidebar.
    toggleLeftSidebar: () =>  any;

    // Show or hide the right sidebar.
    toggleRightSidebar: () =>  any;
}

const mapStateToProps = (state: { ui: UIState }, props: AppOwnProps) => {
    return {
        rendererService: props.rendererService,
        selectedTab: state.ui.selectedTab,
        showLeftSidebar: state.ui.showLeftSidebar,
        showRightSidebar: state.ui.showRightSidebar
    };
};

const mapDispatchToProps = (dispatch: Dispatch<any>) => bindActionCreators({
    selectTab, toggleLeftSidebar, toggleRightSidebar
}, dispatch);

const App = (props: AppProps) => {
    const toggleIcon = (left: boolean) => {
        return left ? 'left' : 'right';
    };

    const toggleClass = (visible: boolean, side: string) => {
        return `toggle-button-${side}` + (visible ? ' visible' : '');
    };

    return (
        <DragDropContextProvider backend={HTML5Backend}>
            <Layout>
                <Layout.Header>
                    <span className='logo'>Athene Wireframes</span>

                    <HistoryMenuContainer />
                    <span className='menu-separator' />

                    <ArrangeMenuContainer />
                    <span className='menu-separator' />

                    <UIMenuContainer />
                </Layout.Header>
                <Layout className='content'>
                    <Layout.Sider width={320} className='sidebar-left'
                        collapsed={!props.showLeftSidebar}
                        collapsedWidth={0}>

                        <Tabs type='card' onTabClick={(key: string) => props.selectTab(key)} activeKey={props.selectedTab}>
                            <Tabs.TabPane key='shapes' tab='Shapes'>
                                <ShapesContainer />
                            </Tabs.TabPane>
                            <Tabs.TabPane key='icons' tab='Icons'>
                                <IconsContainer />
                            </Tabs.TabPane>
                        </Tabs>
                    </Layout.Sider>
                    <Layout.Content className='editor-content'>
                        <EditorViewContainer rendererService={props.rendererService} spacing={40} />
                    </Layout.Content>
                    <Layout.Sider width={330} className='sidebar-right'
                        collapsed={!props.showRightSidebar}
                        collapsedWidth={0}>

                        <Collapse bordered={false} defaultActiveKey={['layout', 'visual', 'custom']}>
                            <Collapse.Panel key='layout' header='Layout'>
                                <LayoutPropertiesContainer />
                            </Collapse.Panel>
                            <Collapse.Panel key='visual' header='Visual'>
                                <VisualPropertiesContainer />
                            </Collapse.Panel>
                            <Collapse.Panel key='custom' header='Custom'>
                                <CustomPropertiesContainer />
                            </Collapse.Panel>
                        </Collapse>
                    </Layout.Sider>

                    <Button icon={toggleIcon(props.showLeftSidebar)}
                        className={toggleClass(props.showLeftSidebar, 'left')}
                        size='small'
                        shape='circle'
                        onClick={() => props.toggleLeftSidebar()} />

                    <Button icon={toggleIcon(!props.showRightSidebar)}
                        className={toggleClass(props.showRightSidebar, 'right')}
                        size='small'
                        shape='circle'
                        onClick={() => props.toggleRightSidebar()} />
                </Layout>
            </Layout>
        </DragDropContextProvider>
    );
};


export const AppContainer = connect(
    mapStateToProps,
    mapDispatchToProps
)(App);