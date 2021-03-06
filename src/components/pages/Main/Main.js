import React, { useEffect, useLayoutEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import io from 'socket.io-client';
import dislike from '../../../assets/dislike.svg';
import like from '../../../assets/like.svg';
import logo from '../../../assets/logo.svg';
import api from '../../../services/api';
import Load from '../../common/Load/Load';
import Match from '../../common/Match/Match';
import './Main.css';

export default function Main({ match }) {
  const [users, setUsers] = useState([]);
  const [matchDev, setMatchDev] = useState(null);
  const [pageLoading, setPageLoading] = useState(false);
  const [dislikeLoading, setDislikeLoading] = useState(false);
  const [loadingUser, setLoadingUser] = useState('');
  const [likeLoading, setLikeLoading] = useState(false);

  useLayoutEffect(() => {
    (async () => {
      setPageLoading(true);

      try {
        const response = await api.get('/devs', {
          headers: {
            user: match.params.id
          }
        });

        setUsers(response.data);
        setPageLoading(false);
      } catch (e) {
        setPageLoading(false);
      }
    })();
  }, [match.params.id]);

  useEffect(() => {
    (async () => {
      const socket = io(process.env.REACT_APP_API_URL, {
        query: { user: match.params.id }
      });

      socket.on('match', dev => {
        setMatchDev(dev);
      });
    })();
  }, [match.params.id]);

  async function handleDislike(id) {
    try {
      setDislikeLoading(true);
      setLoadingUser(id);

      await api.post(`/devs/${id}/dislikes`, null, {
        headers: {
          user: match.params.id
        }
      });

      setUsers(users.filter(user => user._id !== id));
      setDislikeLoading(false);
    } catch (e) {
      setDislikeLoading(false);
    }
  }

  async function handleLike(id) {
    try {
      setLikeLoading(true);
      setLoadingUser(id);

      await api.post(`/devs/${id}/likes`, null, {
        headers: {
          user: match.params.id
        }
      });

      setUsers(users.filter(user => user._id !== id));
      setLikeLoading(false);
    } catch (e) {
      setLikeLoading(false);
    }
  }

  return (
    <div className="main-container">
      <Load isLoading={pageLoading} />

      <Link to="/">
        <span className="logoff">
          <img src={logo} alt="Tindev" />
        </span>
      </Link>

      {users.length > 0 ? (
        <ul>
          {users.map((user, index) => (
            <li key={user._id} style={{ zIndex: users.length - index }}>
              <img src={user.avatar} alt={user.name}></img>
              <footer>
                <strong>{user.name}</strong>
                <p className="max-lines">{user.bio}</p>
              </footer>
              <div className="buttons">
                <button type="button" onClick={() => handleDislike(user._id)}>
                  <Load isLoading={dislikeLoading && loadingUser == user._id}
                    size={30} />
                  <img src={dislike} alt="Dislike" />
                </button>
                <button type="button" onClick={() => handleLike(user._id)}>
                  <Load isLoading={likeLoading && loadingUser == user._id}
                    size={30} />
                  <img src={like} alt="Like" />
                </button>
              </div>
            </li>
          ))}
        </ul>
      ) : !pageLoading && (
        <div className="empty">
          Acabou :(
        </div>
      )}

      <Match matchDev={matchDev} setMatchDev={setMatchDev} />
    </div>
  );
}
