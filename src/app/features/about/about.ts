import { AboutFeature } from '@shared/interfaces/ui/about/about-feature.interface';
import { DeveloperLink } from '@shared/interfaces/ui/about/developer-link.interface';
import { TechStackGroup } from '@shared/interfaces/ui/about/tech-stack-group.interface';

import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  imports: [],
  selector: 'app-about',
  styleUrl: './about.css',
  templateUrl: './about.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class About {
  protected readonly features: readonly AboutFeature[] = [
    {
      title: 'Team Builder',
      description:
        'Draft a squad of up to six Pokemon. Use analysis tools to inspect each aspect of the team.',
    },
    {
      title: 'Pokedex',
      description:
        'Browse and filter the full roster. Search by name, type, or stats and inspect each entry in detail.',
    },
    {
      title: 'Type Chart',
      description:
        'An interactive effectiveness matrix so you always know what hits hard and what to switch out.',
    },
    {
      title: 'Reference Data',
      description:
        'Natures, abilities, items and moves. The supporting data you need while planning a build.',
    },
    {
      title: 'Save & Share Teams',
      description:
        'Save up to 10 teams in your account and share public teams with a link for others to copy.',
    },
    {
      title: 'Accounts',
      description:
        'Register, sign in, and manage your profile with secure, token-based authentication.',
    },
  ];

  protected readonly techStack: readonly TechStackGroup[] = [
    {
      label: 'Frontend',
      items: [
        { name: 'TypeScript' },
        { name: 'Angular' },
        { name: 'RxJS' },
        { name: 'Tailwind CSS' },
        { name: 'PrimeNG' },
      ],
    },
    {
      label: 'Backend',
      items: [
        { name: 'Java' },
        { name: 'Spring Boot' },
        { name: 'Spring Security' },
        { name: 'PostgreSQL' },
        { name: 'JWT' },
      ],
    },
  ];

  protected readonly developer = {
    name: 'Manuel Soler Juan',
    role: 'Full-stack developer',
    bio: `My name is Manuel Soler Juan. I'm a junior dev who likes making interesting projects. This team builder is my first big project`,
  };

  protected readonly support = {
    href: 'https://ko-fi.com/lorelei73269',
    label: 'Support on Ko-fi',
  };

  protected readonly developerLinks: readonly DeveloperLink[] = [
    {
      glyph: 'GH',
      label: 'github.com/Manusolj',
      href: 'https://github.com/Manusolj',
    },
    {
      glyph: '@',
      label: 'manusolerj@gmail.com',
      href: 'mailto:manusolerj@gmail.com',
    },
    {
      glyph: 'in',
      label: 'linkedin.com/in/manuel-soler-juan',
      href: 'https://www.linkedin.com/in/manusolerj',
    },
    // {
    //   glyph: 'web',
    //   label: 'site.dev',
    //   href: 'https://site.dev',
    // },
  ];
}
