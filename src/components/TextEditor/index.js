import React, { useRef } from 'react';
import styled from 'styled-components';
import Editor from 'draft-js-plugins-editor';
import createLinkifyPlugin from 'draft-js-linkify-plugin';
import { JOB_CHARACTERS_ALLOWED } from '../../constants';

const linkifyPlugin = createLinkifyPlugin({
  target: '_blank',
  component: props => {
    // eslint-disable-next-line react/prop-types
    const { href, ...rest } = props;
    // eslint-disable-next-line jsx-a11y/anchor-has-content
    return <a {...rest} onClick={() => window.open(href, '_target')} />;
  },
});

const plugins = [linkifyPlugin];
const TextEditor = ({ editorState, onChange, handlePastedText }) => {
  const editorRef = useRef(null);

  const handleBeforeInput = () => {
    let currentContentLength = editorState.getCurrentContent().getPlainText('').length
    let currentContent = editorState.getCurrentContent()
    if (currentContentLength >= JOB_CHARACTERS_ALLOWED) {
      return 'handled'
    }
  }

  const setFocus = () => {
    editorRef.current.focus();
  };

  return (
    <EditorWrapper onClick={setFocus} className="blue-shadow font-nova">
      <Editor
        spellCheck={true}
        ref={editorRef}
        editorState={editorState}
        onChange={onChange}
        plugins={plugins}
        handleBeforeInput={handleBeforeInput}
        handlePastedText={handlePastedText}
      />
    </EditorWrapper>
  );
};

const EditorWrapper = styled.div`
  box-sizing: border-box;
  border: 1px solid #ddd;
  border-radius: 10px;
  cursor: text;
  padding: 16px;
  color:${props => props.color ? props.color : 'black'}
  border-radius: 2px;
  background: #fefefe;
  width: 100%;
  height: 140px;
  text-align: left;
  resize: vertical;
  overflow-y: auto;
  :globa(.public-DraftEditor-content) {
    min-height: 140px;
  }
  .public-DraftEditorPlaceholder-inner {
    //position: absolute !important;
    color:#bfbfbfc7;
  }
`;

export default TextEditor;
