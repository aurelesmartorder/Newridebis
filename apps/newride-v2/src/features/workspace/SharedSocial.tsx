import { useState, useEffect, useRef, type FormEvent } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  Check,
  Heart,
  Ellipsis,
  Trash2,
  MessageCircle,
  RefreshCw,
  Send,
  UserPlus,
} from "lucide-react";
import { command, type Snapshot, type Post } from "./shared";
import { Dialog } from "../../components/ui";
import { validSocialPayload } from "../../lib/social";
export function SocialConnection({ state }: { state: Snapshot }) {
  return (
    <div className="social-connection">
      <div>
        <span
          className={
            "social-account-dot " + (state.authenticated ? "online" : "")
          }
        />
        <p>
          {state.authenticated
            ? `Connecté · ${state.accountLabel || "Votre compte"}`
            : "Exploration libre · brouillons privés"}
        </p>
      </div>
      {state.authenticated ? (
        <button
          onClick={() => command("social-refresh")}
          disabled={state.socialBusy}
        >
          <RefreshCw size={15} />
          {state.socialBusy ? "Actualisation…" : "Actualiser"}
        </button>
      ) : (
        <Link to="/acces-test">
          Accès test facultatif <ArrowRight size={15} />
        </Link>
      )}
    </div>
  );
}
export function FriendshipPanel({ state }: { state: Snapshot }) {
  const [pseudo, setPseudo] = useState("");
  if (!state.authenticated) return null;
  return (
    <section className="studio-panel friendship-panel">
      <span className="ride-kicker">VOTRE CERCLE / COMPTES RÉELS</span>
      <h2>Retrouvez le second testeur.</h2>
      <p>
        Les publications sont visibles par leur auteur et ses amis acceptés.
        Recherchez le pseudo exact de l’autre compte, sans son adresse email.
      </p>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (validSocialPayload("friend-request", pseudo))
            command("friend-request", pseudo);
        }}
      >
        <label htmlFor="friend-pseudo">Pseudo exact</label>
        <div className="social-inline-form">
          <input
            id="friend-pseudo"
            value={pseudo}
            onChange={(e) => setPseudo(e.target.value)}
            maxLength={80}
            placeholder="Ex. newride.testeur.b"
          />
          <button
            className="studio-dark"
            disabled={
              state.socialBusy || !validSocialPayload("friend-request", pseudo)
            }
          >
            <UserPlus size={17} />
            Inviter
          </button>
        </div>
      </form>
      {state.incoming?.map((request) => (
        <div className="friendship-row" key={request.requesterId}>
          <span>{request.username || "Cavalier"} · demande reçue</span>
          <button
            className="studio-text-link"
            disabled={state.socialBusy}
            onClick={() =>
              command("friend-accept", undefined, request.requesterId)
            }
          >
            Accepter <Check size={17} />
          </button>
        </div>
      ))}
      {state.sent?.map((request) => (
        <p className="friendship-pending" key={request.addresseeId}>
          Demande envoyée à {request.username || "ce cavalier"} · en attente
        </p>
      ))}
      {!!state.friends?.length && (
        <div className="friendship-list">
          {state.friends.map((friend) => (
            <span key={friend.id}>
              <Check size={13} />
              {friend.username || "Cavalier"}
            </span>
          ))}
        </div>
      )}
      {state.socialError && (
        <p className="social-error" role="status">
          {state.socialError}
        </p>
      )}
    </section>
  );
}
function SharedPost({ post, state }: { post: Post; state: Snapshot }) {
  const [comment, setComment] = useState("");
  const [menu,setMenu]=useState(false);
  const [confirmDelete,setConfirmDelete]=useState(false);
  const pending = useRef<string | null>(null);
  useEffect(() => {
    if (!state.socialBusy && pending.current !== null) {
      if (state.socialError) setComment(pending.current);
      pending.current = null;
    }
  }, [state.socialBusy, state.socialError]);
  function submit(e: FormEvent) {
    e.preventDefault();
    if (validSocialPayload("comment", comment, post.id)) {
      pending.current = comment;
      command("comment", comment, post.id);
      setComment("");
    }
  }
  return (
    <article className="studio-panel feed-post">
      <header>
        <span className="feed-avatar">
          {(post.authorName || "C").slice(0, 1)}
        </span>
        <strong>{post.authorName || "Cavalier"}</strong>
        <span>Publication partagée</span>
        {state.authenticated && post.isSelf && <div className="post-options"><button type="button" className="post-options-toggle" aria-label="Options de ma publication" aria-expanded={menu} onClick={()=>setMenu(v=>!v)} disabled={state.socialBusy}><Ellipsis size={23}/></button>{menu && <div className="post-options-menu"><button type="button" onClick={()=>{setMenu(false);setConfirmDelete(true)}}><Trash2 size={17}/>Supprimer la publication</button></div>}</div>}
      </header>
      {confirmDelete && <Dialog title="Supprimer cette publication ?" onClose={()=>{if(!state.socialBusy)setConfirmDelete(false)}}><p>Elle disparaîtra du fil, avec ses commentaires et ses mentions J’aime. Cette suppression est définitive.</p><div className="dialog-actions"><button type="button" className="media-action secondary" disabled={state.socialBusy} onClick={()=>setConfirmDelete(false)}>Conserver</button><button type="button" className="media-action post-delete-button" disabled={state.socialBusy} onClick={()=>{command("delete-post",undefined,post.id);setConfirmDelete(false)}}><Trash2 size={18}/>Supprimer définitivement</button></div></Dialog>}
      {post.photo_url && (
        <img
          src={post.photo_url}
          alt="Publication du cavalier"
          loading="lazy"
        />
      )}
      <p>{post.caption}</p>
      <div className="feed-actions">
        <button
          aria-pressed={!!post.like?.likedByMe}
          disabled={!state.authenticated || state.socialBusy}
          onClick={() => command("like", undefined, post.id)}
        >
          <Heart
            size={18}
            fill={post.like?.likedByMe ? "currentColor" : "none"}
          />
          {post.like?.count || 0} J’aime
        </button>
        <span>
          <MessageCircle size={17} />
          {post.comments?.length || 0} commentaires
        </span>
      </div>
      {post.comments?.map((item) => (
        <div className="feed-comment" key={item.id}>
          <strong>{item.authorName || "Cavalier"}</strong>
          <p>{item.content}</p>
        </div>
      ))}
      {state.authenticated && (
        <form className="social-comment-form" onSubmit={submit}>
          <label className="sr-only" htmlFor={"comment-" + post.id}>
            Commenter la publication de {post.authorName || "ce cavalier"}
          </label>
          <input
            id={"comment-" + post.id}
            value={comment}
            maxLength={2000}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Votre commentaire…"
          />
          <button
            aria-label="Envoyer ce commentaire"
            disabled={
              state.socialBusy ||
              !validSocialPayload("comment", comment, post.id)
            }
          >
            <Send size={17} />
          </button>
        </form>
      )}
    </article>
  );
}
export function SharedFeed({ state }: { state: Snapshot }) {
  return (
    <>
      {state.posts?.map((post) => (
        <SharedPost key={post.id} state={state} post={post} />
      ))}
    </>
  );
}
