interface navbarItemType {
    name: string
    href: string
}


export const navItems: navbarItemType[] = [
    {
        name: 'Dashboard',
        href: '/dashboard'
    },
    {
        name: 'Library',
        href: '/library'
    },
    {
        name: 'Flashcards',
        href: '/flashcards'
    },
    {
        name: 'Exams',
        href: '/exams'
    }
]