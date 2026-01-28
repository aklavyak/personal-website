# Personal Website

A sleek, modern personal website built with Next.js, featuring a projects section and a books section that pulls from Goodreads.

## Features

- 🎨 **Sleek Modern Design**: Clean, responsive layout with smooth animations
- 🌓 **Dark/Light Mode**: Toggle between themes with persistent preference
- 📚 **Books Section**: Displays books read since January 2024, sorted by date
- 📁 **Projects Section**: Ready for your future projects
- 📱 **Fully Responsive**: Works beautifully on all devices
- ⚡ **Next.js 14**: Built with the latest App Router for optimal performance

## Getting Started

### Prerequisites

- Node.js 16+ installed
- npm or yarn package manager

### Installation

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm run dev
```

3. Open your browser to `http://localhost:3000`

## Adding Your Books

1. Export your Goodreads library:
   - Go to Goodreads → My Books
   - Scroll to Tools section → Import/Export
   - Click "Export Library"
   - Save the CSV file as `goodreads-export.csv` in the project root

2. Parse the export:
```bash
npm run parse-books
```

This will:
- Filter books read since January 1, 2024
- Sort them by date descending (most recent first)
- Generate `data/books.json` used by the books page

3. The books will automatically appear on the `/books` page when you refresh

## Customization

### Update Personal Information

- Edit `components/Nav.tsx` to change the name in the logo (currently "Aklavya")
- Update `app/page.tsx` with your personal description
- Modify `components/Footer.tsx` for footer content

### Styling

All styles are in `app/globals.css`. The design uses CSS variables for easy theming:
- `--accent-primary`: Primary accent color
- `--accent-secondary`: Secondary accent color
- `--gradient-primary`: Main gradient for hero and buttons

### Adding Projects

Create new pages in `app/projects/` or update `app/projects/page.tsx` directly.

## Build for Production

```bash
npm run build
npm start
```

## Deployment

### Vercel (Recommended for Next.js)

1. Push your code to GitHub
2. Import your repository in [Vercel](https://vercel.com)
3. Vercel will automatically detect Next.js and configure settings
4. Add your custom domain in project settings

### Other Options

- **Netlify**: Great Next.js support, similar to Vercel
- **Cloudflare Pages**: Excellent performance
- **AWS Amplify**: Enterprise-grade hosting

## Domain Purchase Recommendations

- **Namecheap**: $10-15/year, reliable
- **Cloudflare Registrar**: ~$8-10/year, at-cost pricing
- **Google Domains**: $12/year, simple interface

## Project Structure

```
├── app/                  # Next.js App Router pages
│   ├── layout.tsx       # Root layout
│   ├── page.tsx         # Homepage
│   ├── books/           # Books page
│   ├── projects/        # Projects page
│   └── globals.css      # Global styles
├── components/          # React components
│   ├── Nav.tsx         # Navigation
│   └── Footer.tsx      # Footer
├── data/               # Data files (books.json)
├── lib/                # Utility functions
├── scripts/            # Build scripts (parse-goodreads.js)
└── package.json        # Dependencies
```

## License

MIT
