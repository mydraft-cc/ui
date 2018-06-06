import { Alert } from 'antd';
import * as React from 'react';
import { connect } from 'react-redux';

import { UIStateInStore } from '@app/wireframes/model';

import './user-message.scss';

interface UserMessageProps {
    // The error message
    errorToast?: string;

    // The info message
    infoToast?: string;
}

const mapStateToProps = (state: UIStateInStore) => {
    return { errorToast: state.ui.errorToast, infoToast: state.ui.infoToast };
};

const UserMessage = (props: UserMessageProps) => {
    return (
        <div className='toast-container'>
            {props.infoToast &&
                <Alert message={props.infoToast} showIcon={true} className='toast' type='success' />
            }
            {props.errorToast &&
                <Alert message={props.errorToast} showIcon={true} className='toast' type='error' />
            }
        </div>
    );
};

export const UserMessageContainer = connect(
    mapStateToProps
)(UserMessage);