//
// LibreTexts Conductor
// ConductorChatUI/index.js
// A reusable chat thread interface for use in
// the Conductor UI.
//

import './ConductorChatUI.css';

import {
    Header,
    Button,
    Modal,
    Icon,
    Loader,
    Comment
} from 'semantic-ui-react';
import React, { useEffect, useState, memo } from 'react';
import ConductorTextArea from '../ConductorTextArea';
import axios from 'axios';
import DOMPurify from 'dompurify';
import marked from 'marked';
import date from 'date-and-time';
import ordinal from 'date-and-time/plugin/ordinal';
import day_of_week from 'date-and-time/plugin/day-of-week';

import { isEmptyString } from '../HelperFunctions.js';

import useGlobalError from '../../error/ErrorHooks.js';

const ConductorChatUI = ({
    projectID,
    user,
    mode,
    kind,
    activeThread,
    activeThreadTitle,
    activeThreadMsgs,
    loadedThreadMsgs,
    getThreads,
    getMessages,
}) => {

    // Global State and Eror Handling
    const { handleGlobalError } = useGlobalError();

    // Delete Message Modal
    const [showDelMsgModal, setShowDelMsgModal] = useState(false);
    const [delMsgID, setDelMsgID] = useState('');
    const [delMsgLoading, setDelMsgLoading] = useState(false);

    // Chat
    const [messageCompose, setMessageCompose] = useState('');
    const [messageSending, setMessageSending] = useState(false);


    /** INITIALIZATION **/
    useEffect(() => {
        date.plugin(ordinal);
        date.plugin(day_of_week);
        // Hook to force message links to open in new window
        DOMPurify.addHook('afterSanitizeAttributes', function (node) {
          if ('target' in node) {
            node.setAttribute('target', '_blank');
            node.setAttribute('rel', 'noopener noreferrer')
          }
        });
    }, []);


    const sendMessage = () => {
        if (!isEmptyString(messageCompose)) {
            setMessageSending(true);
            let msgData = { message: messageCompose };
            let postURL;
            if (kind === 'project' || kind === 'a11y' || kind === 'peerreview') {
                postURL = '/project/thread/message';
                msgData.threadID = activeThread;
            } else {
                postURL = '/project/task/message';
                msgData.taskID = activeThread;
            }
            axios.post(postURL, msgData).then((res) => {
                if (!res.data.err) {
                    if (getThreads !== null) {
                        getThreads();
                    }
                    getMessages();
                    setMessageCompose('');
                } else {
                    handleGlobalError(res.data.errMsg);
                }
                setMessageSending(false);
            }).catch((err) => {
                handleGlobalError(err);
                setMessageSending(false);
            });
        }
    };


    const openDelMsgModal = (msgID) => {
        if (msgID !== null && !isEmptyString(msgID)) {
            setDelMsgID(msgID);
            setDelMsgLoading(false);
            setShowDelMsgModal(true);
        }
    };


    const closeDelMsgModal = () => {
        setShowDelMsgModal(false);
        setDelMsgID('');
        setDelMsgLoading(false);
    };


    const submitDeleteMessage = () => {
        setDelMsgLoading(true);
        let deleteURL;
        if (kind === 'project') deleteURL = '/project/thread/message';
        else deleteURL = '/project/task/message'
        axios.delete(deleteURL, {
            data: {
                messageID: delMsgID
            }
        }).then((res) => {
            if (!res.data.err) {
                if (getThreads !== null) {
                    getThreads();
                }
                getMessages();
                closeDelMsgModal();
            } else {
                setDelMsgLoading(false);
                handleGlobalError(res.data.errMsg);
            }
        }).catch((err) => {
            handleGlobalError(err);
            setDelMsgLoading(false);
        });
    };


    return (
        <div id='project-discussion-messages'>
            <div className='flex-col-div' id='project-messages-container'>
                <div className='flex-row-div' id='project-messages-header-container'>
                    <div className='left-flex'>
                        <Header as='h3'>
                            {(activeThreadTitle !== '')
                                ? <em>{activeThreadTitle}</em>
                                : <span>Messages</span>
                            }
                        </Header>
                    </div>
                    <div className='right-flex' id='project-messages-header-options'>

                    </div>
                </div>
                <div id='project-messages-chat-container'>
                    {(loadedThreadMsgs && activeThreadMsgs.length > 0) &&
                        <Comment.Group id='project-messages-chat-list'>
                            {activeThreadMsgs.map((item, idx) => {
                                const today = new Date();
                                const itemDate = new Date(item.createdAt);
                                if (today.getDate() === itemDate.getDate()) { // today
                                    item.date = 'Today';
                                } else if ((today.getDate() - itemDate.getDate()) >= 7) { // a week ago
                                    item.date = date.format(itemDate, 'MMM DDD, YYYY')
                                } else { // this week
                                    item.date = date.format(itemDate, 'dddd');
                                }
                                item.time = date.format(itemDate, 'h:mm A');
                                const readyMsgBody = {
                                    __html: DOMPurify.sanitize(marked(item.body, { breaks: true }))
                                };
                                return (
                                    <Comment className='project-messages-message' key={item.messageID}>
                                      <Comment.Avatar src={item.author?.avatar || '/mini_logo.png'} />
                                      <Comment.Content>
                                        <Comment.Author as='span'>{item.author?.firstName} {item.author?.lastName}</Comment.Author>
                                        <Comment.Metadata>
                                          <div>{item.date} at {item.time}</div>
                                        </Comment.Metadata>
                                        <Comment.Text dangerouslySetInnerHTML={readyMsgBody}></Comment.Text>
                                        {(item.author?.uuid === user.uuid) &&
                                            <Comment.Actions>
                                                <Comment.Action onClick={() => openDelMsgModal(item.messageID)}>Delete</Comment.Action>
                                            </Comment.Actions>
                                        }
                                      </Comment.Content>
                                    </Comment>
                                )
                            })}
                        </Comment.Group>
                    }
                    {(loadedThreadMsgs && activeThreadMsgs.length === 0) &&
                        <p className='text-center muted-text mt-4r'><em>No messages yet. Send one below!</em></p>
                    }
                    {(!loadedThreadMsgs && activeThread !== '') &&
                        <Loader active inline='centered' className='mt-4r' />
                    }
                    {(activeThread === '' && activeThreadMsgs.length === 0) &&
                        <p className='text-center muted-text mt-4r'><em>{mode === 'standalone' ? 'No chat identifier specified!' : 'No thread selected. Select one from the list on the left or create one using the + button!'}</em></p>
                    }
                </div>
                <div id='project-messages-reply-container'>
                    <ConductorTextArea
                        placeholder='Send a message...'
                        textValue={messageCompose}
                        onTextChange={(value) => setMessageCompose(value)}
                        disableSend={(activeThread === '') || (messageCompose === '')}
                        sendLoading={messageSending}
                        onSendClick={sendMessage}
                    />
                </div>
            </div>
            {/* Delete Discussion Message Modal */}
            <Modal
                open={showDelMsgModal}
                onClose={closeDelMsgModal}
            >
                <Modal.Header>Delete Message</Modal.Header>
                <Modal.Content>
                    <p>Are you sure you want to this message? <span className='muted-text'>(MessageID: {delMsgID})</span></p>
                    <p><strong>This action is irreversible.</strong></p>
                </Modal.Content>
                <Modal.Actions>
                    <Button
                        onClick={closeDelMsgModal}
                    >
                        Cancel
                    </Button>
                    <Button
                        color='red'
                        loading={delMsgLoading}
                        onClick={submitDeleteMessage}
                    >
                        <Icon name='trash' />
                        Delete Message
                    </Button>
                </Modal.Actions>
            </Modal>
        </div>
    )
};

ConductorChatUI.defaultProps = {
    projectID: '',
    user: {},
    mode: 'messaging',
    kind: 'project',
    activeThread: '',
    activeThreadTitle: 'Messages',
    activeThreadMsgs: [],
    loadedThreadMsgs: false,
    getThreads: null,
    getMessages: () => {}
};

export default memo(ConductorChatUI);
