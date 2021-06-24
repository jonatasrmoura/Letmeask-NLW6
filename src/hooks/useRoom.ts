import { useEffect, useState } from "react";
import { database } from "../services/firebase";
import { useAuth } from "./useAuth";

type FireBaseQuestions = Record<string, {
  author: {
    name: string;
    avatar: string;
  },
  content: string;
  isAnswered: boolean;
  isHighlighted: boolean;

  likes: Record<string, {
    authorId: string;
  }>
}>

type QuestionProps = {
  id: string;
  author: {
    name: string;
    avatar: string;
  },
  content: string;
  isAnswered: boolean;
  isHighlighted: boolean;
  likeCount: number;
  likeId: string | undefined;
};

export function useRoom(roomId: string) {
  const { user } = useAuth();
  const [questions, setQuestions] = useState<QuestionProps[]>([]);
  const [title, setTitle] = useState('');

  useEffect(() => {
    // Buscar os dados das perguntas no Firebase
    const roomFef = database.ref(`rooms/${roomId}`);

    roomFef.on('value', room => {
      // converter para vetor as questions que estão retornando.
      const databaseRoom = room.val();
      const fireBaseQuestions: FireBaseQuestions = databaseRoom.questions ?? {};
      const parsedQuestions = Object.entries(fireBaseQuestions).map(([key, value]) => {
        return {
          id: key,
          content: value.content,
          author: value.author,
          isHighlighted: value.isHighlighted,
          isAnswered: value.isAnswered,

          likeCount: Object.values(value.likes ?? {}).length,
          likeId: Object.entries(value.likes ?? {}).find(([key, like]) => like.authorId === user?.id)?.[0],
        };
      });

      setTitle(databaseRoom.title);
      setQuestions(parsedQuestions);
    });

    return () => {
      roomFef.off('value');
    };
  }, [roomId, user?.id]);

  return { questions, title };
};