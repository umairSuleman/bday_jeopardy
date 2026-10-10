import { Sparkles } from './components/Sparkles';
import { BoardPage } from './components/board/BoardPage';
import { CluePage } from './components/clue/CluePage';
import { BuzzPage } from './components/buzz/BuzzPage';
import { useRoutePath } from './router';

const CLUE_ROUTE = /^\/clue\/(\d+)\/(\d+)$/;

function Screen() {
  const path = useRoutePath();

  if (path === '/buzz') return <BuzzPage />;

  const clue = CLUE_ROUTE.exec(path);
  if (clue) {
    return (
      <CluePage
        // Keyed so switching clues remounts with fresh reveal state.
        key={path}
        categoryIndex={Number(clue[1])}
        clueIndex={Number(clue[2])}
      />
    );
  }

  return <BoardPage />;
}

export function App() {
  return (
    <>
      <Sparkles />
      <Screen />
    </>
  );
}
