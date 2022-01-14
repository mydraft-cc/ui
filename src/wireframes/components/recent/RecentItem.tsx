/*
 * mydraft.cc
 *
 * @license
 * Copyright (c) Sebastian Stehle. All rights reserved.
*/

import { DownloadOutlined } from '@ant-design/icons';
import { Button, Col, Row, Typography } from 'antd';
import { formatDistanceToNow } from 'date-fns';
import * as React from 'react';
import { RecentDiagram } from '@app/wireframes/model';

export interface RecentItemProps {
    // The diagram.
    item: RecentDiagram;

    // Triggered when it should be loaded.
    onLoad: (item: RecentDiagram) => void;
}

export const RecentItem = React.memo((props: RecentItemProps) => {
    const { item, onLoad } = props;

    return (
        <>
            <Row className='recent-item' wrap={false}>
                <Col flex='auto'>
                    <div>
                        <Typography.Text strong>{item.tokenToRead}</Typography.Text>
                    </div>
                    <div>
                        <Typography.Text type='secondary'>{formatDistanceToNow(new Date(item.date), { addSuffix: true })}</Typography.Text>
                    </div>
                </Col>

                <Col flex='none'>
                    <Button onClick={() => onLoad(item)}>
                        <DownloadOutlined />
                    </Button>
                </Col>
            </Row>
        </>
    );
});
