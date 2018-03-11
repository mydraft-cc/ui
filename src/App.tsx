import * as React from 'react';
import { connect } from 'react-redux';
import { bindActionCreators, Dispatch } from 'redux';
import { Collapse, Layout, Tabs } from 'antd';

import {
    ArrangeMenuContainer,
    CustomPropertiesContainer,
    HistoryMenuContainer,
    LayoutPropertiesContainer,
    UIMenuContainer,
    VisualPropertiesContainer
} from '@app/wireframes/components';

import {
    RendererService,
    selectTab,
    UIState
} from '@app/wireframes/model';

import { EditorContainer } from '@app/wireframes/renderer/editor';

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
    selectTab
}, dispatch);

const App = (props: AppProps) => {
    return (
        <Layout>
            <Layout.Header>
                <span className='logo'>Athene Wireframes</span>

                <HistoryMenuContainer />
                <span className='menu-separator' />

                <ArrangeMenuContainer />
                <span className='menu-separator' />

                <UIMenuContainer />
            </Layout.Header>
            <Layout>
                <Layout.Sider width={320} className='sidebar-left'
                    collapsed={!props.showLeftSidebar}
                    collapsedWidth={0}>
                    <Tabs type='card' onTabClick={(key: string) => props.selectTab(key)} activeKey={props.selectedTab}>
                        <Tabs.TabPane key='shapes' tab='Shapes'>
                        </Tabs.TabPane>
                        <Tabs.TabPane key='icons' tab='Icons'>
                        </Tabs.TabPane>
                        <Tabs.TabPane key='pages' tab='Pages'>
                        </Tabs.TabPane>
                    </Tabs>
                </Layout.Sider>
                <Layout.Content>
                    <EditorContainer rendererService={props.rendererService} />
                </Layout.Content>
                <Layout.Sider width={320} className='sidebar-right'
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
            </Layout>
        </Layout>
    );
};


export const AppContainer = connect(
    mapStateToProps,
    mapDispatchToProps
)(App);