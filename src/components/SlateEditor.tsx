import React, { useCallback, useMemo } from 'react';
import isHotkey from 'is-hotkey';
import { Editable, withReact, useSlate, Slate } from 'slate-react';
import {
  Editor,
  Transforms,
  createEditor,
  Element as SlateElement,
} from 'slate';
import { withHistory } from 'slate-history';

import { Button, Icon, Toolbar } from './components';

import { CustomEditor, CustomText, CustomElement } from './slate-types';
import { LinkBtn } from './LinkBtn';
import Link from 'next/link';
import ColorPicker from './ColorPicker';
import FontPicker from './FontPicker';

const HOTKEYS: Record<string, string> = {
  'mod+b': 'bold',
  'mod+i': 'italic',
  'mod+u': 'underline',
  'mod+`': 'code',
};

const LIST_TYPES = ['numbered-list', 'bulleted-list'] as const;
const TEXT_ALIGN_TYPES = ['left', 'center', 'right', 'justify'] as const;

const RichTextExample: React.FC = () => {
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
        <MarkButton
          format='code'
          icon='code'
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
        <BlockButton
          format='justify'
          icon='format_align_justify'
        />
        <LinkBtn />
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
  );
};

const toggleBlock = (editor: CustomEditor, format: string) => {
  const isActive = isBlockActive(
    editor,
    format,
    TEXT_ALIGN_TYPES.includes(format as 'left' | 'center' | 'right' | 'justify')
      ? 'align'
      : 'type'
  );
  const isList = LIST_TYPES.includes(
    format as 'numbered-list' | 'bulleted-list'
  );

  Transforms.unwrapNodes(editor, {
    match: (n) =>
      !Editor.isEditor(n) &&
      SlateElement.isElement(n) &&
      LIST_TYPES.includes(
        (n as CustomElement).type as 'numbered-list' | 'bulleted-list'
      ),
    split: true,
  });

  let newProperties: Partial<CustomElement>;
  if (
    TEXT_ALIGN_TYPES.includes(format as 'left' | 'center' | 'right' | 'justify')
  ) {
    newProperties = {
      align: isActive
        ? undefined
        : (format as 'left' | 'center' | 'right' | 'justify'),
    };
  } else {
    newProperties = {
      type: isActive ? 'paragraph' : (format as CustomElement['type']),
    };
  }

  Transforms.setNodes(editor, newProperties);

  if (!isActive && isList) {
    const block: CustomElement = {
      type: format as 'numbered-list' | 'bulleted-list',
      children: [],
    };
    Transforms.wrapNodes(editor, block);
  }
};

const toggleMark = (editor: CustomEditor, format: string) => {
  const isActive = isMarkActive(editor, format);

  if (isActive) {
    Editor.removeMark(editor, format);
  } else {
    Editor.addMark(editor, format, true);
  }
};

const isBlockActive = (
  editor: CustomEditor,
  format: string,
  blockType: 'type' | 'align' = 'type'
) => {
  const { selection } = editor;
  if (!selection) return false;

  const [match] = Array.from(
    Editor.nodes(editor, {
      at: Editor.unhangRange(editor, selection),
      match: (n) =>
        !Editor.isEditor(n) &&
        SlateElement.isElement(n) &&
        (n as CustomElement)[blockType] === format,
    })
  );

  return !!match;
};

export const isMarkActive = (editor: CustomEditor, format: string) => {
  const marks = Editor.marks(editor) as { [key: string]: boolean } | undefined;
  return marks ? marks[format] === true : false;
};

const Element: React.FC<{
  attributes: any;
  children: React.ReactNode;
  element: CustomElement;
}> = ({ attributes, children, element }) => {
  const style = { textAlign: element.align };
  switch (element.type) {
    case 'block-quote':
      return (
        <blockquote
          className='border-l-4 border-gray-300 pl-4 italic text-gray-700'
          style={style}
          {...attributes}
        >
          {children}
        </blockquote>
      );
    case 'bulleted-list':
      return (
        <ul
          style={style}
          {...attributes}
        >
          {children}
        </ul>
      );
    case 'heading-one':
      return (
        <h1
          className='text-4xl font-bold'
          style={style}
          {...attributes}
        >
          {children}
        </h1>
      );
    case 'heading-two':
      return (
        <h2
          className='text-3xl font-semibold'
          style={style}
          {...attributes}
        >
          {children}
        </h2>
      );
    case 'list-item':
      return (
        <li
          style={style}
          {...attributes}
        >
          {children}
        </li>
      );
    case 'numbered-list':
      return (
        <ol
          style={style}
          {...attributes}
        >
          {children}
        </ol>
      );
    case 'link':
      return (
        <Link
          className='cursor-pointer'
          href={element.url}
          style={style}
          target='_blank'
          rel='noreferrer'
          {...attributes}
        >
          {children}
        </Link>
      );
    default:
      return (
        <p
          style={style}
          {...attributes}
        >
          {children}
        </p>
      );
  }
};

const Leaf: React.FC<{
  attributes: any;
  children: React.ReactNode;
  leaf: CustomText;
}> = ({ attributes, children, leaf }) => {
  if (leaf.bold) {
    children = <strong>{children}</strong>;
  }

  if (leaf.code) {
    children = <code>{children}</code>;
  }

  if (leaf.italic) {
    children = <em>{children}</em>;
  }

  if (leaf.underline) {
    children = <u>{children}</u>;
  }

  return (
    <span
      {...attributes}
      style={{ color: leaf.color, fontSize: leaf.size }}
    >
      {children}
    </span>
  );
};

const BlockButton: React.FC<{ format: string; icon: string }> = ({
  format,
  icon,
}) => {
  const editor = useSlate();
  return (
    <Button
      active={isBlockActive(
        editor,
        format,
        TEXT_ALIGN_TYPES.includes(
          format as 'left' | 'center' | 'right' | 'justify'
        )
          ? 'align'
          : 'type'
      )}
      onMouseDown={(event: React.MouseEvent) => {
        event.preventDefault();
        toggleBlock(editor, format);
      }}
    >
      <Icon>{icon}</Icon>
    </Button>
  );
};

const MarkButton: React.FC<{ format: string; icon: string }> = ({
  format,
  icon,
}) => {
  const editor = useSlate();
  return (
    <Button
      active={isMarkActive(editor, format)}
      onMouseDown={(event: React.MouseEvent<HTMLButtonElement>) => {
        event.preventDefault();
        toggleMark(editor, format);
      }}
    >
      <Icon>{icon}</Icon>
    </Button>
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
      { text: ' better than a ' },
      { text: '<textarea>', code: true },
      { text: '!' },
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

export default RichTextExample;
