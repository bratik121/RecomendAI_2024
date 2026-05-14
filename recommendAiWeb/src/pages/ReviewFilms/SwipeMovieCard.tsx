import {
  motion,
  useMotionValue,
  useTransform,
  PanInfo,
} from "framer-motion";
import { FaHeart, FaTimes } from "react-icons/fa";
import MovieCard from "./MovieCard";

interface SwipeMovieCardProps {
  movie: {
    id: number;
    title: string;
    poster_path: string;
    genres: string[];
    release_year: string;
    vote_average: number;
  };
  onLike: () => void;
  onDislike: () => void;
}

const SWIPE_THRESHOLD = 120;

function SwipeMovieCard({ movie, onLike, onDislike }: SwipeMovieCardProps) {
  const x = useMotionValue(0);

  const rotate = useTransform(x, [-200, 0, 200], [-12, 0, 12]);

  const background = useTransform(x, [-150, 0, 150], [
    "linear-gradient(180deg, rgba(239,68,68,0.35) 0%, rgba(127,29,29,0.15) 100%)",
    "linear-gradient(180deg, rgba(15,23,42,0.25) 0%, rgba(2,6,23,0.1) 100%)",
    "linear-gradient(180deg, rgba(9,217,158,0.35) 0%, rgba(20,83,45,0.15) 100%)",
  ]);

  const likeOpacity = useTransform(x, [30, 150], [0, 1]);
  const dislikeOpacity = useTransform(x, [-30, -150], [0, 1]);

  const likeScale = useTransform(x, [30, 150], [0.8, 1.15]);
  const dislikeScale = useTransform(x, [-30, -150], [0.8, 1.15]);

  const handleDragEnd = (
    _event: MouseEvent | TouchEvent | PointerEvent,
    info: PanInfo
  ) => {
    const offsetX = info.offset.x;
    const velocityX = info.velocity.x;

    if (offsetX > SWIPE_THRESHOLD || velocityX > 700) {
      onLike();
      return;
    }

    if (offsetX < -SWIPE_THRESHOLD || velocityX < -700) {
      onDislike();
      return;
    }
  };

  return (
    <motion.div
      className="relative md:min-w-[600px] w-full min-h-[520px] flex justify-center items-center rounded-3xl overflow-hidden"
      style={{ background }}
    >
      <motion.div
        className="absolute top-8 right-8 z-20 flex items-center gap-2 rounded-full border border-primary-500/50 bg-primary-500/10 px-5 py-3 text-primary-400 shadow-lg"
        style={{ opacity: likeOpacity, scale: likeScale }}
      >
        <FaHeart className="text-2xl" />
        <span className="text-lg font-bold">LIKE</span>
      </motion.div>

      <motion.div
        className="absolute top-8 left-8 z-20 flex items-center gap-2 rounded-full border border-red-500/50 bg-red-500/10 px-5 py-3 text-red-400 shadow-lg"
        style={{ opacity: dislikeOpacity, scale: dislikeScale }}
      >
        <FaTimes className="text-2xl" />
        <span className="text-lg font-bold">NOPE</span>
      </motion.div>

      <motion.div
        className="cursor-grab active:cursor-grabbing"
        style={{ x, rotate }}
        drag="x"
        dragConstraints={{ left: 0, right: 0 }}
        dragElastic={0.55}
        onDragEnd={handleDragEnd}
        whileTap={{ scale: 0.97 }}
        initial={{ opacity: 0, y: 40, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{
          opacity: 0,
          scale: 0.85,
          transition: { duration: 0.2 },
        }}
        transition={{ type: "spring", stiffness: 260, damping: 24 }}
      >
        <MovieCard
          title={movie.title}
          poster_path={movie.poster_path}
          genres={movie.genres}
          release_year={movie.release_year}
          vote_average={movie.vote_average}
        />
      </motion.div>
    </motion.div>
  );
}

export default SwipeMovieCard;