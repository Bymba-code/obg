import React, { useEffect, useState, useCallback, useMemo } from "react";
import css from "./style.module.css";
import axiosInstance from "../../Services/axiosService";
import { useAuth } from "../../Context/authContext";

const Blog = () => {
  const { user } = useAuth();
  const currentUserId = parseInt(user.id);

  const [fetching, setFetching] = useState(false);
  const [posts, setPosts] = useState([]);
  const [error, setError] = useState(null);
  const [newPostContent, setNewPostContent] = useState("");
  const [commentInput, setCommentInput] = useState({});
  const [replyInput, setReplyInput] = useState({});
  const [editPostId, setEditPostId] = useState(null);
  const [editCommentId, setEditCommentId] = useState(null);
  const [editReplyId, setEditReplyId] = useState(null);
  const [editContent, setEditContent] = useState("");
  const [showComments, setShowComments] = useState({});
  const [showReplies, setShowReplies] = useState({});
  const [activeTab, setActiveTab] = useState('posts');
  
  const [loadingStates, setLoadingStates] = useState({
    addPost: false,
    reactions: {},
    comments: {},
    replies: {}
  });

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = useCallback(async () => {
    setFetching(true);
    setError(null);
    try {
      const response = await axiosInstance.get("/posts");
      if (response?.status === 200 && response.data.success) {
        setPosts(response.data.data);
      } else {
        setError(response?.data?.message || "Өгөгдөл олдсонгүй.");
      }
    } catch (err) {
      setError(err?.response?.data?.message || "Серверийн алдаа гарлаа.");
    } finally {
      setFetching(false);
    }
  }, []);

  // Calculate user stats
  const userStats = useMemo(() => {
    const myPosts = posts.filter(p => p.user === currentUserId).length;
    let myComments = 0;
    let myReactions = 0;

    posts.forEach(post => {
      myComments += post.comment_comment_postTopost?.filter(c => c.user === currentUserId).length || 0;
      myReactions += post.comment_reactions_comment_reactions_postTopost?.filter(r => r.user === currentUserId).length || 0;
    });

    return { myPosts, myComments, myReactions };
  }, [posts, currentUserId]);

  // Calculate leaderboard data
  const leaderboardData = useMemo(() => {
    const userStatsMap = {};

    posts.forEach(post => {
      // Post counts
      if (!userStatsMap[post.user]) {
        userStatsMap[post.user] = {
          userId: post.user,
          name: `${post.users?.first_name || ''} ${post.users?.last_name || ''}`.trim(),
          avatar: post.users?.first_name?.[0] || "U",
          posts: 0,
          comments: 0,
          reactions: 0,
        };
      }
      userStatsMap[post.user].posts++;

      // Comment counts
      post.comment_comment_postTopost?.forEach(comment => {
        if (!userStatsMap[comment.user]) {
          userStatsMap[comment.user] = {
            userId: comment.user,
            name: `${comment.users?.first_name || ''} ${comment.users?.last_name || ''}`.trim(),
            avatar: comment.users?.first_name?.[0] || comment.users?.last_name?.[0] || "U",
            posts: 0,
            comments: 0,
            reactions: 0,
          };
        }
        userStatsMap[comment.user].comments++;
      });

      // Reaction counts
      post.comment_reactions_comment_reactions_postTopost?.forEach(reaction => {
        if (!userStatsMap[reaction.user]) {
          userStatsMap[reaction.user] = {
            userId: reaction.user,
            name: `Хэрэглэгч ${reaction.user}`,
            avatar: "U",
            posts: 0,
            comments: 0,
            reactions: 0,
          };
        }
        userStatsMap[reaction.user].reactions++;
      });
    });

    const statsArray = Object.values(userStatsMap);

    return {
      posts: [...statsArray].sort((a, b) => b.posts - a.posts).slice(0, 5),
      comments: [...statsArray].sort((a, b) => b.comments - a.comments).slice(0, 5),
      reactions: [...statsArray].sort((a, b) => b.reactions - a.reactions).slice(0, 5),
    };
  }, [posts]);

  const getMedalEmoji = (index) => {
    if (index === 0) return "🥇";
    if (index === 1) return "🥈";
    if (index === 2) return "🥉";
    return `${index + 1}`;
  };

  const toggleComments = useCallback((postId) => {
    setShowComments(prev => ({ ...prev, [postId]: !prev[postId] }));
  }, []);

  const toggleReplies = useCallback((commentId) => {
    setShowReplies(prev => ({ ...prev, [commentId]: !prev[commentId] }));
  }, []);

  const optimisticUpdate = useCallback((updateFn) => {
    setPosts(prevPosts => updateFn(prevPosts));
  }, []);

  const handleAddPost = useCallback(async () => {
    if (!newPostContent.trim()) return;
    
    setLoadingStates(prev => ({ ...prev, addPost: true }));
    const tempContent = newPostContent;
    const tempId = `temp-${Date.now()}`;
    
    const tempPost = {
      id: tempId,
      content: tempContent,
      user: currentUserId,
      users: { first_name: user.first_name, last_name: user.last_name },
      date: new Date().toISOString(),
      comment_reactions_comment_reactions_postTopost: [],
      comment_comment_postTopost: []
    };
    
    setPosts(prev => [tempPost, ...prev]);
    setNewPostContent("");

    try {
      const response = await axiosInstance.post("/posts", { content: tempContent });
      if (response?.status === 200 && response.data.success) {
        setPosts(prev => prev.map(p => p.id === tempId ? response.data.data : p));
      } else {
        setError(response?.data?.message);
        setPosts(prev => prev.filter(p => p.id !== tempId));
        setNewPostContent(tempContent);
      }
    } catch (err) {
      setError(err?.response?.data?.message || "Алдаа гарлаа.");
      setPosts(prev => prev.filter(p => p.id !== tempId));
      setNewPostContent(tempContent);
    } finally {
      setLoadingStates(prev => ({ ...prev, addPost: false }));
    }
  }, [newPostContent, currentUserId, user]);

  const handleEditPost = useCallback(async (postId) => {
    if (!editContent.trim()) return;
    
    const oldContent = posts.find(p => p.id === postId)?.content;
    
    optimisticUpdate(prevPosts => 
      prevPosts.map(p => p.id === postId ? { ...p, content: editContent } : p)
    );
    
    setEditPostId(null);
    setEditContent("");

    try {
      const response = await axiosInstance.put(`/posts/${postId}`, { content: editContent });
      if (response?.status === 200 && response.data.success) {
        fetchPosts();
      } else {
        throw new Error(response?.data?.message);
      }
    } catch (err) {
      setError(err?.response?.data?.message || "Алдаа гарлаа.");
      optimisticUpdate(prevPosts => 
        prevPosts.map(p => p.id === postId ? { ...p, content: oldContent } : p)
      );
    }
  }, [editContent, posts, optimisticUpdate, fetchPosts]);

  const handleDeletePost = useCallback(async (postId) => {
    if (!window.confirm("Та энэ постыг устгах уу?")) return;
    
    const deletedPost = posts.find(p => p.id === postId);
    setPosts(prev => prev.filter(p => p.id !== postId));

    try {
      const response = await axiosInstance.delete(`/posts/${postId}`);
      if (!(response?.status === 200 && response.data.success)) {
        throw new Error(response?.data?.message);
      }
    } catch (err) {
      setError(err?.response?.data?.message || "Алдаа гарлаа.");
      setPosts(prev => [deletedPost, ...prev]);
    }
  }, [posts]);

  const handleAddComment = useCallback(async (postId) => {
    const content = commentInput[postId]?.trim();
    if (!content) return;
    
    setLoadingStates(prev => ({ 
      ...prev, 
      comments: { ...prev.comments, [postId]: true } 
    }));

    const tempContent = content;
    const tempCommentId = `temp-${Date.now()}`;
    
    setShowComments(prev => ({ ...prev, [postId]: true }));
    
    const tempComment = {
      id: tempCommentId,
      content: tempContent,
      user: currentUserId,
      users: { 
        username: user.username || user.first_name,
        first_name: user.first_name,
        last_name: user.last_name
      },
      replies_replies_commentTocomment: []
    };

    setPosts(prev => prev.map(p => {
      if (p.id === postId) {
        return {
          ...p,
          comment_comment_postTopost: [...(p.comment_comment_postTopost || []), tempComment]
        };
      }
      return p;
    }));

    setCommentInput(prev => ({ ...prev, [postId]: "" }));

    try {
      const response = await axiosInstance.post("/comments", { post: postId, content: tempContent });
      if (response?.status === 200 && response.data.success) {
        setPosts(prev => prev.map(p => {
          if (p.id === postId) {
            return {
              ...p,
              comment_comment_postTopost: p.comment_comment_postTopost.map(c => 
                c.id === tempCommentId ? response.data.data : c
              )
            };
          }
          return p;
        }));
      } else {
        throw new Error(response?.data?.message);
      }
    } catch (err) {
      setError(err?.response?.data?.message || "Алдаа гарлаа.");
      setPosts(prev => prev.map(p => {
        if (p.id === postId) {
          return {
            ...p,
            comment_comment_postTopost: p.comment_comment_postTopost.filter(c => c.id !== tempCommentId)
          };
        }
        return p;
      }));
      setCommentInput(prev => ({ ...prev, [postId]: tempContent }));
    } finally {
      setLoadingStates(prev => ({ 
        ...prev, 
        comments: { ...prev.comments, [postId]: false } 
      }));
    }
  }, [commentInput, currentUserId, user]);

  const handleEditComment = useCallback(async (commentId) => {
    if (!editContent.trim()) return;
    
    setEditCommentId(null);
    setEditContent("");

    try {
      const response = await axiosInstance.put(`/comments/${commentId}`, { content: editContent });
      if (response?.status === 200 && response.data.success) {
        fetchPosts();
      }
    } catch (err) {
      setError(err?.response?.data?.message || "Алдаа гарлаа.");
    }
  }, [editContent, fetchPosts]);

  const handleDeleteComment = useCallback(async (commentId) => {
    if (!window.confirm("Та энэ сэтгэгдлийг устгах уу?")) return;
    
    try {
      const response = await axiosInstance.delete(`/comments/${commentId}`);
      if (response?.status === 200 && response.data.success) fetchPosts();
    } catch (err) {
      setError(err?.response?.data?.message || "Алдаа гарлаа.");
    }
  }, [fetchPosts]);

  const handleAddReply = useCallback(async (commentId, postId) => {
    const content = replyInput[commentId]?.trim();
    if (!content) return;
    
    setLoadingStates(prev => ({ 
      ...prev, 
      replies: { ...prev.replies, [commentId]: true } 
    }));

    const tempContent = content;
    const tempReplyId = `temp-${Date.now()}`;
    
    const tempReply = {
      id: tempReplyId,
      content: tempContent,
      user: currentUserId,
      users: { 
        username: user.username || user.first_name,
        first_name: user.first_name,
        last_name: user.last_name
      }
    };

    setPosts(prev => prev.map(p => {
      if (p.id === postId) {
        return {
          ...p,
          comment_comment_postTopost: p.comment_comment_postTopost.map(c => {
            if (c.id === commentId) {
              return {
                ...c,
                replies_replies_commentTocomment: [...(c.replies_replies_commentTocomment || []), tempReply]
              };
            }
            return c;
          })
        };
      }
      return p;
    }));

    setReplyInput(prev => ({ ...prev, [commentId]: "" }));

    try {
      const response = await axiosInstance.post("/replies", { comment: commentId, content: tempContent });
      if (response?.status === 200 && response.data.success) {
        setPosts(prev => prev.map(p => {
          if (p.id === postId) {
            return {
              ...p,
              comment_comment_postTopost: p.comment_comment_postTopost.map(c => {
                if (c.id === commentId) {
                  return {
                    ...c,
                    replies_replies_commentTocomment: c.replies_replies_commentTocomment.map(r =>
                      r.id === tempReplyId ? response.data.data : r
                    )
                  };
                }
                return c;
              })
            };
          }
          return p;
        }));
      } else {
        throw new Error(response?.data?.message);
      }
    } catch (err) {
      setError(err?.response?.data?.message || "Алдаа гарлаа.");
      setPosts(prev => prev.map(p => {
        if (p.id === postId) {
          return {
            ...p,
            comment_comment_postTopost: p.comment_comment_postTopost.map(c => {
              if (c.id === commentId) {
                return {
                  ...c,
                  replies_replies_commentTocomment: c.replies_replies_commentTocomment.filter(r => r.id !== tempReplyId)
                };
              }
              return c;
            })
          };
        }
        return p;
      }));
      setReplyInput(prev => ({ ...prev, [commentId]: tempContent }));
    } finally {
      setLoadingStates(prev => ({ 
        ...prev, 
        replies: { ...prev.replies, [commentId]: false } 
      }));
    }
  }, [replyInput, currentUserId, user]);

  const handleEditReply = useCallback(async (replyId) => {
    if (!editContent.trim()) return;
    
    setEditReplyId(null);
    setEditContent("");

    try {
      const response = await axiosInstance.put(`/replies/${replyId}`, { content: editContent });
      if (response?.status === 200 && response.data.success) {
        fetchPosts();
      }
    } catch (err) {
      setError(err?.response?.data?.message || "Алдаа гарлаа.");
    }
  }, [editContent, fetchPosts]);

  const handleDeleteReply = useCallback(async (replyId) => {
    if (!window.confirm("Та энэ reply-г устгах уу?")) return;
    
    try {
      const response = await axiosInstance.delete(`/replies/${replyId}`);
      if (response?.status === 200 && response.data.success) fetchPosts();
    } catch (err) {
      setError(err?.response?.data?.message || "Алдаа гарлаа.");
    }
  }, [fetchPosts]);

  const handleAddReaction = useCallback(async (postId, type) => {
    const reactionKey = `${postId}-${type}`;
    let rollbackData = null;
    
    setPosts(prev => {
      const newPosts = prev.map(p => {
        if (p.id === postId) {
          const reactions = [...(p.comment_reactions_comment_reactions_postTopost || [])];
          rollbackData = { postId, oldReactions: reactions };
          
          const existingIndex = reactions.findIndex(r => r.user === currentUserId);
          
          if (existingIndex >= 0) {
            if (reactions[existingIndex].type === type) {
              reactions.splice(existingIndex, 1);
            } else {
              reactions[existingIndex] = { 
                ...reactions[existingIndex], 
                type,
                id: reactions[existingIndex].id
              };
            }
          } else {
            reactions.push({ 
              type, 
              user: currentUserId, 
              id: `temp-${Date.now()}`
            });
          }
          
          return { 
            ...p, 
            comment_reactions_comment_reactions_postTopost: reactions 
          };
        }
        return p;
      });
      
      return newPosts;
    });

    setLoadingStates(prev => ({
      ...prev,
      reactions: { ...prev.reactions, [reactionKey]: true }
    }));

    try {
      const response = await axiosInstance.post("/reactions", { 
        post: postId, 
        type 
      });
      
      if (response?.status === 200 && response.data.success) {
        const newReaction = response.data.data;
        
        setPosts(prev =>
          prev.map(p => {
            if (p.id === postId) {
              const reactions = p.comment_reactions_comment_reactions_postTopost || [];
              const tempReactionIndex = reactions.findIndex(
                r => r.user === currentUserId && r.type === type
              );
              
              if (tempReactionIndex >= 0) {
                reactions[tempReactionIndex] = {
                  ...reactions[tempReactionIndex],
                  id: newReaction.id
                };
              }
              
              return { 
                ...p, 
                comment_reactions_comment_reactions_postTopost: [...reactions] 
              };
            }
            return p;
          })
        );
      } else {
        throw new Error(response?.data?.message || "Алдаа гарлаа.");
      }
    } catch (err) {
      if (rollbackData) {
        setPosts(prev =>
          prev.map(p =>
            p.id === rollbackData.postId
              ? { 
                  ...p, 
                  comment_reactions_comment_reactions_postTopost: rollbackData.oldReactions 
                }
              : p
          )
        );
      }
      
      setError(err?.response?.data?.message || "Reaction нэмэхэд алдаа гарлаа.");
    } finally {
      setLoadingStates(prev => ({
        ...prev,
        reactions: { ...prev.reactions, [reactionKey]: false }
      }));
    }
  }, [currentUserId]);

  const getReactionCounts = useCallback((reactions) => {
    return [1, 2, 3, 4].map(type => {
      const count = reactions?.filter(r => r.type === type).length || 0;
      const emoji = type === 1 ? "⚡" : type === 2 ? "😂" : type === 3 ? "❤️" : "😎";
      return { type, count, emoji };
    }).filter(r => r.count > 0);
  }, []);

  if (fetching && posts.length === 0) {
    return <div className={css.loading}>
      <div className={css.spinner}></div>
      <p>Уншиж байна...</p>
    </div>;
  }

  return (
    <div className={css.blogContainer}>
      <main className={css.mainContent}>
        <div className={css.blog}>
          {error && <div className={css.error}>{error}</div>}

          <div className={css.newPost}>
            <div className={css.newPostHeader}>
              <div className={css.avatar}>{user.first_name?.[0] || "U"}</div>
              <textarea
                className={css.textarea}
                placeholder="Юу бодож байна?"
                value={newPostContent}
                onChange={(e) => setNewPostContent(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && e.ctrlKey) {
                    handleAddPost();
                  }
                }}
                disabled={loadingStates.addPost}
              />
            </div>
            <div className={css.newPostFooter}>
              <button 
                className={css.addButton} 
                onClick={handleAddPost}
                disabled={loadingStates.addPost || !newPostContent.trim()}
              >
                {loadingStates.addPost ? (
                  <>
                    <span className={css.buttonSpinner}></span>
                    Нэмж байна...
                  </>
                ) : (
                  <>
                    <span>✨</span>
                    Пост нэмэх
                  </>
                )}
              </button>
            </div>
          </div>

          {posts.map((post) => {
            const reactionCounts = getReactionCounts(post.comment_reactions_comment_reactions_postTopost);
            
            return (
              <div key={post.id} className={css.post}>
                <div className={css.header}>
                  <div className={css.userInfo}>
                    <div className={css.avatar}>{post.users?.first_name?.[0] || "U"}</div>
                    <div className={css.userDetails}>
                      <div className={css.username}>
                        {post.users?.first_name} {post.users?.last_name}
                      </div>
                      <div className={css.date}>{new Date(post.date).toLocaleString("mn-MN")}</div>
                    </div>
                  </div>
                  
                  {post.user === currentUserId && (
                    <div className={css.postMenu}>
                      {editPostId === post.id ? (
                        <div className={css.editMode}>
                          <input 
                            type="text" 
                            value={editContent} 
                            onChange={(e) => setEditContent(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') handleEditPost(post.id);
                              if (e.key === 'Escape') setEditPostId(null);
                            }}
                            autoFocus
                            className={css.editInput}
                          />
                          <button onClick={() => handleEditPost(post.id)} className={css.saveBtn}>✓</button>
                          <button onClick={() => setEditPostId(null)} className={css.cancelBtn}>✕</button>
                        </div>
                      ) : (
                        <div className={css.postActions}>
                          <button onClick={() => { 
                            setEditPostId(post.id); 
                            setEditContent(post.content); 
                          }} className={css.editBtn}>✏️</button>
                          <button onClick={() => handleDeletePost(post.id)} className={css.deleteBtn}>🗑️</button>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                <div className={css.content}>{post.content}</div>

                <div className={css.reactions}>
                  {reactionCounts.length > 0 && (
                    <div className={css.reactionDisplay}>
                      {reactionCounts.map(({ type, count, emoji }) => (
                        <span key={type} className={css.reactionBadge}>
                          {emoji} {count}
                        </span>
                      ))}
                    </div>
                  )}

                  <div className={css.reactionButtons}>
                    {[1, 2, 3, 4].map(type => {
                      const emoji = type === 1 ? "⚡" : type === 2 ? "😂" : type === 3 ? "❤️" : "😎";
                      const isLoading = loadingStates.reactions[`${post.id}-${type}`];
                      
                      return (
                        <button 
                          key={type}
                          onClick={() => handleAddReaction(post.id, type)}
                          disabled={isLoading}
                          className={css.reactionBtn}
                        >
                          {isLoading ? <span className={css.miniSpinner}></span> : emoji}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className={css.commentsSection}>
                  {post.comment_comment_postTopost?.length > 0 && (
                    <button 
                      className={css.toggleCommentsBtn}
                      onClick={() => toggleComments(post.id)}
                    >
                      {showComments[post.id] ? '▼' : '▶'} 
                      <span>{post.comment_comment_postTopost.length} сэтгэгдэл</span>
                    </button>
                  )}

                  {showComments[post.id] && post.comment_comment_postTopost?.map((comment) => (
                    <div key={comment.id} className={css.comment}>
                      <div className={css.commentAvatar}>{comment.users?.last_name?.[0] || "U"}</div>
                      <div className={css.commentBody}>
                        <div className={css.commentContent}>
                          <b className={css.commentAuthor}>{comment.users?.last_name?.slice(0,1)}. {comment.users?.first_name}: </b>
                          <span className={css.commentText}>{comment.content}</span>
                        </div>

                        {comment.user === currentUserId && (
                          <div className={css.commentActions}>
                            {editCommentId === comment.id ? (
                              <>
                                <input 
                                  type="text" 
                                  value={editContent} 
                                  onChange={(e) => setEditContent(e.target.value)}
                                  onKeyDown={(e) => {
                                    if (e.key === 'Enter') handleEditComment(comment.id);
                                    if (e.key === 'Escape') setEditCommentId(null);
                                  }}
                                  autoFocus
                                  className={css.commentEditInput}
                                />
                                <button onClick={() => handleEditComment(comment.id)} className={css.smallSaveBtn}>✓</button>
                                <button onClick={() => setEditCommentId(null)} className={css.smallCancelBtn}>✕</button>
                              </>
                            ) : (
                              <>
                                <button onClick={() => { 
                                  setEditCommentId(comment.id); 
                                  setEditContent(comment.content); 
                                }} className={css.smallEditBtn}>Засах</button>
                                <button onClick={() => handleDeleteComment(comment.id)} className={css.smallDeleteBtn}>Устгах</button>
                              </>
                            )}
                          </div>
                        )}

                        {comment.replies_replies_commentTocomment?.map((reply) => (
                          <div key={reply.id} className={css.reply}>
                            <div className={css.replyAvatar}>{reply.users?.username?.[0] || "U"}</div>
                            <div className={css.replyBody}>
                              <div className={css.replyContent}>
                                <b className={css.replyAuthor}>{reply.users?.first_name?.slice(0,1)}. {reply.users?.last_name} :</b>
                                <span className={css.replyText}>{reply.content}</span>
                              </div>

                              {reply.user === currentUserId && (
                                <div className={css.replyActions}>
                                  {editReplyId === reply.id ? (
                                    <>
                                      <input 
                                        type="text" 
                                        value={editContent} 
                                        onChange={(e) => setEditContent(e.target.value)}
                                        onKeyDown={(e) => {
                                          if (e.key === 'Enter') handleEditReply(reply.id);
                                          if (e.key === 'Escape') setEditReplyId(null);
                                        }}
                                        autoFocus
                                        className={css.replyEditInput}
                                      />
                                      <button onClick={() => handleEditReply(reply.id)} className={css.tinyBtn}>✓</button>
                                      <button onClick={() => setEditReplyId(null)} className={css.tinyBtn}>✕</button>
                                    </>
                                  ) : (
                                    <>
                                      <button onClick={() => { 
                                        setEditReplyId(reply.id); 
                                        setEditContent(reply.content); 
                                      }} className={css.tinyEditBtn}>✏️</button>
                                      <button onClick={() => handleDeleteReply(reply.id)} className={css.tinyDeleteBtn}>🗑️</button>
                                    </>
                                  )}
                                </div>
                              )}
                            </div>
                          </div>
                        ))}

                        <div className={css.replyForm}>
                          <input
                            type="text"
                            placeholder="Хариулах..."
                            value={replyInput[comment.id] || ""}
                            onChange={(e) => setReplyInput((prev) => ({ ...prev, [comment.id]: e.target.value }))}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') handleAddReply(comment.id, post.id);
                            }}
                            disabled={loadingStates.replies[comment.id]}
                            className={css.replyInput}
                          />
                          <button 
                            onClick={() => handleAddReply(comment.id, post.id)}
                            disabled={loadingStates.replies[comment.id] || !replyInput[comment.id]?.trim()}
                            className={css.replySubmitBtn}
                          >
                            {loadingStates.replies[comment.id] ? <span className={css.miniSpinner}></span> : "↵"}
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}

                  <div className={css.commentForm}>
                    <div className={css.commentAvatar}>{user.first_name?.[0] || "U"}</div>
                    <input
                      type="text"
                      placeholder="Сэтгэгдэл бичих..."
                      value={commentInput[post.id] || ""}
                      onChange={(e) => setCommentInput((prev) => ({ ...prev, [post.id]: e.target.value }))}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleAddComment(post.id);
                      }}
                      disabled={loadingStates.comments[post.id]}
                      className={css.commentInput}
                    />
                    <button 
                      onClick={() => handleAddComment(post.id)}
                      disabled={loadingStates.comments[post.id] || !commentInput[post.id]?.trim()}
                      className={css.commentSubmitBtn}
                    >
                      {loadingStates.comments[post.id] ? <span className={css.miniSpinner}></span> : "💬"}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </main>

      <aside className={css.sidebar}>
        <div className={css.sidebarCard}>
          <div className={css.profileSection}>
            <div className={css.profileAvatar}>{user.first_name?.[0] || "U"}</div>
            <h3 className={css.profileName}>{user.first_name} {user.last_name}</h3>
            <p className={css.profileUsername}>@{user.username || "user"}</p>
          </div>
          
          <div className={css.statsSection}>
            <div className={css.statItem}>
              <div className={css.statIcon}>📝</div>
              <div className={css.statInfo}>
                <div className={css.statValue}>{userStats.myPosts}</div>
                <div className={css.statLabel}>Постууд</div>
              </div>
            </div>
            
            <div className={css.statItem}>
              <div className={css.statIcon}>💬</div>
              <div className={css.statInfo}>
                <div className={css.statValue}>{userStats.myComments}</div>
                <div className={css.statLabel}>Сэтгэгдэл</div>
              </div>
            </div>
            
            <div className={css.statItem}>
              <div className={css.statIcon}>⚡</div>
              <div className={css.statInfo}>
                <div className={css.statValue}>{userStats.myReactions}</div>
                <div className={css.statLabel}>Реакшн</div>
              </div>
            </div>
          </div>
        </div>

        {/* Leaderboard Card */}
        <div className={css.leaderboardCard}>
          <div className={css.leaderboardHeader}>
            <h3 className={css.leaderboardTitle}>
              <span className={css.leaderboardIcon}>🏆</span>
              Тэргүүлэгчид
            </h3>
          </div>

          {/* Leaderboard Tabs */}
          <div className={css.leaderboardTabs}>
            <button 
              className={`${css.leaderboardTab} ${activeTab === 'posts' ? css.active : ''}`}
              onClick={() => setActiveTab('posts')}
            >
              <span className={css.tabIcon}>📝</span>
              <span className={css.tabLabel}>Пост</span>
            </button>
            <button 
              className={`${css.leaderboardTab} ${activeTab === 'comments' ? css.active : ''}`}
              onClick={() => setActiveTab('comments')}
            >
              <span className={css.tabIcon}>💬</span>
              <span className={css.tabLabel}>Сэтгэгдэл</span>
            </button>
            <button 
              className={`${css.leaderboardTab} ${activeTab === 'reactions' ? css.active : ''}`}
              onClick={() => setActiveTab('reactions')}
            >
              <span className={css.tabIcon}>⚡</span>
              <span className={css.tabLabel}>Реакшн</span>
            </button>
          </div>

          {/* Leaderboard List */}
          <div className={css.leaderboardList}>
            {leaderboardData[activeTab].length === 0 ? (
              <div className={css.leaderboardEmpty}>
                <div className={css.emptyIcon}>📊</div>
                <p className={css.emptyText}>Өгөгдөл байхгүй байна</p>
              </div>
            ) : (
              leaderboardData[activeTab].map((userData, index) => (
                <div 
                  key={userData.userId} 
                  className={`${css.leaderboardItem} ${index < 3 ? css.topThree : ''} ${userData.userId === currentUserId ? css.currentUser : ''}`}
                >
                  <div className={css.leaderboardRank}>
                    {index < 3 ? (
                      <span className={css.medalEmoji}>{getMedalEmoji(index)}</span>
                    ) : (
                      <span className={css.rankNumber}>{index + 1}</span>
                    )}
                  </div>
                  
                  <div className={css.leaderboardAvatar}>
                    {userData.avatar}
                  </div>
                  
                  <div className={css.leaderboardInfo}>
                    <div className={css.leaderboardName}>{userData.name}</div>
                    <div className={css.leaderboardScore}>
                      {activeTab === 'posts' && `${userData.posts} пост`}
                      {activeTab === 'comments' && `${userData.comments} сэтгэгдэл`}
                      {activeTab === 'reactions' && `${userData.reactions} реакшн`}
                    </div>
                  </div>
                  
                  <div className={css.leaderboardBadge}>
                    {activeTab === 'posts' && userData.posts}
                    {activeTab === 'comments' && userData.comments}
                    {activeTab === 'reactions' && userData.reactions}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </aside>
    </div>
  );
};

export default Blog;