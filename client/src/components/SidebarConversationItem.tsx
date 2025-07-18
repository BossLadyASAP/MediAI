import React, { useState, KeyboardEvent, ChangeEvent } from 'react';
import { Conversation } from '../types/chat';

interface SidebarConversationItemProps {
  conversation: Conversation;
  isActive: boolean;
  onSelect: () => void;
  onRename: (newTitle: string) => Promise<void>;
  onDelete: () => Promise<void>;
}

const SidebarConversationItem: React.FC<SidebarConversationItemProps> = ({
  conversation,
  isActive,
  onSelect,
  onRename,
  onDelete,
}) => {
  const [renaming, setRenaming] = useState(false);
  const [title, setTitle] = useState(conversation.title || 'Untitled');
  const [loading, setLoading] = useState(false);

  const handleRenameClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setRenaming(true);
  };

  const handleDeleteClick = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm('Delete this conversation?')) {
      setLoading(true);
      await onDelete();
      setLoading(false);
    }
  };

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    setTitle(e.target.value);
  };

  const handleInputBlur = async () => {
    if (title.trim() && title !== conversation.title) {
      setLoading(true);
      await onRename(title.trim());
      setLoading(false);
    }
    setRenaming(false);
  };

  const handleInputKeyDown = async (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      (e.target as HTMLInputElement).blur();
    } else if (e.key === 'Escape') {
      setRenaming(false);
      setTitle(conversation.title || 'Untitled');
    }
  };

  return (
    <div
      className={`flex items-center p-2 rounded cursor-pointer mb-1 gap-2 ${isActive ? 'bg-blue-200 font-bold' : 'hover:bg-gray-200'}`}
      onClick={onSelect}
    >
      {renaming ? (
        <input
          className="flex-1 px-1 py-0.5 rounded border border-gray-300"
          value={title}
          onChange={handleInputChange}
          onBlur={handleInputBlur}
          onKeyDown={handleInputKeyDown}
          autoFocus
          disabled={loading}
        />
      ) : (
        <span className="flex-1 truncate" title={title}>{title}</span>
      )}
      <button
        className="text-xs text-gray-500 hover:text-blue-600 px-1"
        title="Rename"
        onClick={handleRenameClick}
        disabled={loading}
        tabIndex={-1}
      >
        ✏️
      </button>
      <button
        className="text-xs text-gray-500 hover:text-red-600 px-1"
        title="Delete"
        onClick={handleDeleteClick}
        disabled={loading}
        tabIndex={-1}
      >
        🗑️
      </button>
    </div>
  );
};

export default SidebarConversationItem;
