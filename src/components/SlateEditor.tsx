import React, { useCallback, useMemo } from 'react';
import isHotkey from 'is-hotkey';
import { Editable, withReact, Slate } from 'slate-react';
import { createEditor } from 'slate';
import { withHistory } from 'slate-history';
import { Toolbar } from './components';
import { CustomEditor, CustomText, CustomElement } from '../lib/slate-types';
import { LinkBtn } from './toolbar/LinkBtn';
import ColorPicker from './toolbar/ColorPicker';
import FontPicker from './toolbar/FontPicker';
import { Element } from './Element';
import { Leaf } from './Leaf';
import { BlockButton } from './toolbar/BlockButton';
import { MarkButton, toggleMark } from './toolbar/MarkButton';
import { ImageBtn } from './toolbar/ImageBtn';

const HOTKEYS: Record<string, string> = {
  'mod+b': 'bold',
  'mod+i': 'italic',
  'mod+u': 'underline',
};

const SlateEditor: React.FC = () => {
  const renderElement = useCallback(
    (props: {
      attributes: any;
      children: React.ReactNode;
      element: CustomElement;
    }) => <Element {...props} />,
    []
  );
  const renderLeaf = useCallback(
    (props: {
      attributes: any;
      children: React.ReactNode;
      leaf: CustomText;
    }) => <Leaf {...props} />,
    []
  );

  const editor = useMemo(
    () => withHistory(withReact(createEditor() as CustomEditor)),
    []
  );

  return (
    <div className='flex flex-col justify-start'>
      <Slate
        editor={editor}
        initialValue={initialValue}
      >
        <Toolbar>
          <MarkButton
            format='bold'
            icon='format_bold'
          />
          <MarkButton
            format='italic'
            icon='format_italic'
          />
          <MarkButton
            format='underline'
            icon='format_underlined'
          />
          <ColorPicker
            format='color'
            icon='format_color_text'
          />
          <FontPicker
            format='size'
            icon='format_size'
          />
          <BlockButton
            format='heading-one'
            icon='looks_one'
          />
          <BlockButton
            format='heading-two'
            icon='looks_two'
          />
          <BlockButton
            format='block-quote'
            icon='format_quote'
          />
          <BlockButton
            format='numbered-list'
            icon='format_list_numbered'
          />
          <BlockButton
            format='bulleted-list'
            icon='format_list_bulleted'
          />
          <BlockButton
            format='left'
            icon='format_align_left'
          />
          <BlockButton
            format='center'
            icon='format_align_center'
          />
          <BlockButton
            format='right'
            icon='format_align_right'
          />
          <LinkBtn />
          <ImageBtn />
        </Toolbar>
        <Editable
          renderElement={renderElement}
          renderLeaf={renderLeaf}
          placeholder='Enter some rich text…'
          spellCheck
          autoFocus
          onKeyDown={(event) => {
            for (const hotkey in HOTKEYS) {
              if (isHotkey(hotkey, event as any)) {
                event.preventDefault();
                const mark = HOTKEYS[hotkey];
                toggleMark(editor, mark);
              }
            }
          }}
        />
      </Slate>
    </div>
  );
};

const initialValue: CustomElement[] = [
  {
    type: 'paragraph',
    children: [
      { text: 'This is editable ' },
      { text: 'rich', bold: true },
      { text: ' text, ' },
      { text: 'much', italic: true },
      { text: ' better than a <textarea>!' },
    ],
  },
  {
    type: 'paragraph',
    children: [
      {
        text: "Since it's rich text, you can do things like turn a selection of text ",
      },
      { text: 'bold', bold: true },
      {
        text: ', or add a semantically rendered block quote in the middle of the page, like this:',
      },
    ],
  },
  {
    type: 'block-quote',
    children: [{ text: 'A wise quote.' }],
  },
  {
    type: 'heading-one',
    children: [{ text: 'Heading One' }],
  },
  {
    type: 'heading-two',
    children: [{ text: 'Heading Two' }],
  },
  {
    type: 'paragraph',
    align: 'center',
    children: [{ text: 'Try it out for yourself!' }],
  },
];

export default SlateEditor;
