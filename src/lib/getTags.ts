import { context, getOctokit } from '@actions/github'

export class GetTags {
  constructor(
    private ctx: typeof context,
    private getOkit: typeof getOctokit
  ) {}

  async getTagsFromGithub(ghToken: string) {
    let result: Array<{
      name: string
      commit: {
        sha: string
        url: string
      }
      zipball_url: string
      tarball_url: string
      node_id: string
    }> = []
    try {
      if (ghToken) {
        const octokit = this.getOkit(ghToken)

        const res = await octokit.rest.repos.listTags({
          repo: this.ctx.repo.repo,
          owner: this.ctx.repo.owner,
        })

        result = res.data
      }
    } catch (err) {
      console.log(err)
    }

    return result
  }
}
