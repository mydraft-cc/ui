/*
 * mydraft.cc
 *
 * @license
 * Copyright (c) Sebastian Stehle. All rights reserved.
*/

import { LeftOutlined, RightOutlined } from '@ant-design/icons';
import { usePrinter } from '@app/core';
import { ArrangeMenu, ClipboardMenu, CustomProperties, EditorView, HistoryMenu, Icons, LayoutProperties, LoadingMenu, LockMenu, PrintRenderer, SettingsMenu, Shapes, UIMenu, VisualProperties } from '@app/wireframes/components';
import { loadDiagramAsync, newDiagram, selectTab, showInfoToast, toggleLeftSidebar, toggleRightSidebar, useStore } from '@app/wireframes/model';
import { Button, Collapse, Layout, Tabs } from 'antd';
import * as React from 'react';
import { useDispatch } from 'react-redux';
import { useRouteMatch } from 'react-router';

const logo = require('./images/logo-square-64.png').default;

export const App = () => {
    const dispatch = useDispatch();
    const route = useRouteMatch();
    const routeToken = route.params['token'] || null;
    const selectedTab = useStore(s => s.ui.selectedTab);
    const showLeftSidebar = useStore(s => s.ui.showLeftSidebar);
    const showRightSidebar = useStore(s => s.ui.showRightSidebar);

    const [
        print,
        printReady,
        isPrinting,
        ref,
    ] = usePrinter();

    React.useEffect(() => {
        if (routeToken && routeToken.length > 0) {
            dispatch(loadDiagramAsync({ token: routeToken, navigate: false }));
        } else {
            dispatch(newDiagram({ navigate: false }));
        }
    }, [dispatch, routeToken]);

    React.useEffect(() => {
        if (isPrinting) {
            dispatch(showInfoToast('Printing started...'));
        }
    }, [dispatch, isPrinting]);

    const doSelectTab = React.useCallback((key: string) => {
        dispatch(selectTab(key));
    }, [dispatch]);

    const doToggleLeftSidebar = React.useCallback(() => {
        dispatch(toggleLeftSidebar());
    }, [dispatch]);

    const doToggleRightSidebar = React.useCallback(() => {
        dispatch(toggleRightSidebar());
    }, [dispatch]);

    return (
        <>
            <Layout className='screen-mode'>
                <Layout.Header>
                    <img className='logo' src={logo} alt='mydraft.cc' />

                    <HistoryMenu />
                    <span className='menu-separator' />

                    <LockMenu />
                    <span className='menu-separator' />

                    <ArrangeMenu />
                    <span className='menu-separator' />

                    <ClipboardMenu />
                    <span className='menu-separator' />

                    <UIMenu />
                    <span className='menu-separator' />

                    <SettingsMenu print={print} />

                    <span style={{ float: 'right' }}>
                        <LoadingMenu />
                    </span>
                </Layout.Header>
                <Layout className='content'>
                    <Layout.Sider width={320} className='sidebar-left'
                        collapsed={!showLeftSidebar}
                        collapsedWidth={0}>

                        <Tabs type='card' onTabClick={doSelectTab} activeKey={selectedTab}>
                            <Tabs.TabPane key='shapes' tab='Shapes'>
                                <Shapes />
                            </Tabs.TabPane>
                            <Tabs.TabPane key='icons' tab='Icons'>
                                <Icons />
                            </Tabs.TabPane>
                        </Tabs>
                    </Layout.Sider>
                    <Layout.Content className='editor-content'>
                        <EditorView spacing={40} />
                    </Layout.Content>
                    <Layout.Sider width={330} className='sidebar-right'
                        collapsed={!showRightSidebar}
                        collapsedWidth={0}>

                        <Collapse bordered={false} defaultActiveKey={['layout', 'visual', 'custom']}>
                            <Collapse.Panel key='layout' header='Layout'>
                                <LayoutProperties />
                            </Collapse.Panel>
                            <Collapse.Panel key='visual' header='Visual'>
                                <VisualProperties />
                            </Collapse.Panel>
                            <Collapse.Panel key='custom' header='Custom'>
                                <CustomProperties />
                            </Collapse.Panel>
                        </Collapse>
                    </Layout.Sider>

                    <Button icon={<ToggleIcon left={showLeftSidebar} />}
                        className={toggleClass(showLeftSidebar, 'left')}
                        size='small'
                        shape='circle'
                        onClick={doToggleLeftSidebar} />

                    <Button icon={<ToggleIcon left={!showRightSidebar} />}
                        className={toggleClass(showRightSidebar, 'right')}
                        size='small'
                        shape='circle'
                        onClick={doToggleRightSidebar} />
                </Layout>
            </Layout>

            {isPrinting &&
                <div className='print-mode' ref={ref}>
                    <PrintRenderer onRender={printReady} />
                </div>
            }
        </>
    );
};

const ToggleIcon = ({ left }: { left: boolean }) => {
    return left ? <LeftOutlined /> : <RightOutlined />;
};

const toggleClass = (visible: boolean, side: string) => {
    return `toggle-button-${side} ${visible ? 'visible' : ''}`;
};
